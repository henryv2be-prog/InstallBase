import { redirect } from "next/navigation";

export default function BragsRedirect() {
  redirect("/discover?tab=leaderboard");
}
