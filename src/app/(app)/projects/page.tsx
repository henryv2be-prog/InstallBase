import { redirect } from "next/navigation";

export default function ProjectsRedirect() {
  redirect("/discover?tab=projects");
}
