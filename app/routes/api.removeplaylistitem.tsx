import { json } from "@remix-run/node";
import { toggleSongInPlaylist } from "../lib/server";

export const loader = async ({ request }: { request: Request }) => {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");
  const songId = url.searchParams.get("songId");

  if (!userId || !songId) {
    return json(
      { success: false, error: "Missing userId or songId" },
      { status: 400 }
    );
  }

  try {
    await toggleSongInPlaylist(userId, songId);
    return json({ success: true });
  } catch (error) {
    return json({ success: false, error: String(error) }, { status: 500 });
  }
};
