import { NextResponse } from "next/server";

export async function POST(req) {
  const { url } = await req.json();

  // 这里应该是实际的Spotify API调用逻辑
  // 为了演示，我们只返回一个模拟的封面URL
  const mockCoverUrl =
    "https://i.scdn.co/image/ab67616d0000b27309e04447db867468ba7be2f6";

  return NextResponse.json({ coverUrl: mockCoverUrl });
}
