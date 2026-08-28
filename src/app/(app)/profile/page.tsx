import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProfileRedirectPage() {
  const session = await auth();
  if (session?.user?.username) {
    redirect(`/profile/${session.user.username}`);
  }
  redirect("/login");
}
