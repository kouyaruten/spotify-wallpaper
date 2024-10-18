import { NextResponse } from "next/server";

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

async function getAccessToken() {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();
  return data.access_token;
}

async function getSpotifyInfo(type, id, accessToken) {
  const endpoints = {
    album: `https://api.spotify.com/v1/albums/${id}`,
    artist: `https://api.spotify.com/v1/artists/${id}`,
    track: `https://api.spotify.com/v1/tracks/${id}`,
    show: `https://api.spotify.com/v1/shows/${id}`,
    episode: `https://api.spotify.com/v1/episodes/${id}`,
    playlist: `https://api.spotify.com/v1/playlists/${id}`,
  };

  const response = await fetch(endpoints[type], {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();

  let coverUrl, name;

  switch (type) {
    case "album":
    case "track":
      coverUrl = data.images?.[0]?.url || data.album?.images?.[0]?.url;
      name = data.name;
      break;
    case "artist":
      coverUrl = data.images?.[0]?.url;
      name = data.name;
      break;
    case "show":
    case "episode":
      coverUrl = data.images?.[0]?.url;
      name = data.name || data.show?.name;
      break;
    case "playlist":
      coverUrl = data.images?.[0]?.url;
      name = data.name;
      break;
  }

  return { coverUrl, name };
}

export async function POST(req) {
  const { url } = await req.json();
  const urlParts = url.split("/");
  const type = urlParts[urlParts.length - 2];
  const id = urlParts[urlParts.length - 1].split("?")[0];

  try {
    const accessToken = await getAccessToken();
    const { coverUrl, name } = await getSpotifyInfo(type, id, accessToken);
    return NextResponse.json({ coverUrl, name });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch Spotify data" },
      { status: 500 }
    );
  }
}
