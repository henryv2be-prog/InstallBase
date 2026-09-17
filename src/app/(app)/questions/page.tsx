import { redirect } from "next/navigation";

export default function QuestionsRedirect() {
  redirect("/discover?tab=questions");
}
