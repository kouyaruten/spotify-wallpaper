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

async function getAlbumInfo(albumId, accessToken) {
  console.log({ albumId, accessToken });
  const response = await fetch(`https://api.spotify.com/v1/albums/${albumId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();
  console.log(data);
  return {
    coverUrl: data.images[0].url,
    albumName: data.name,
  };
}

export async function POST(req) {
  // Fake response for testing
  //   return NextResponse.json({
  //     coverUrl:
  //       "https://i.scdn.co/image/ab67616d0000b27309e04447db867468ba7be2f6",
  //     albumName: "Fiction",
  //   });

  const { url } = await req.json();
  const albumId = url.split("/").pop().split("?")[0];

  try {
    const accessToken = await getAccessToken();
    const { coverUrl, albumName } = await getAlbumInfo(albumId, accessToken);
    return NextResponse.json({ coverUrl, albumName });
  } catch (error) {
    console.error("Error fetching Spotify data:", error);
    return NextResponse.json(
      { error: "Failed to fetch Spotify data" },
      { status: 500 }
    );
  }
}
