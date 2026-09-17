import { redirect } from "next/navigation";

interface MessagesRedirectProps {
  searchParams: Promise<{ user?: string }>;
}

export default async function MessagesRedirect({ searchParams }: MessagesRedirectProps) {
  const { user } = await searchParams;
  if (user) {
    redirect(`/activity?tab=messages&user=${encodeURIComponent(user)}`);
  }
  redirect("/activity?tab=messages");
}
