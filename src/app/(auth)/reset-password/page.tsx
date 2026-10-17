import { redirect } from "next/navigation";

export const metadata = { title: "Reset password" };

/** Legacy query links: /reset-password?token=… → path form (better for mobile email clients). */
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token = "" } = await searchParams;
  const trimmed = token.trim();
  if (trimmed) {
    redirect(`/reset-password/${encodeURIComponent(trimmed)}`);
  }
  redirect("/forgot-password?reason=missing-token");
}
