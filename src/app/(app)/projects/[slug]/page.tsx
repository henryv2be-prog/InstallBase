import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getProject } from "@/lib/queries";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";
import { MapPin } from "lucide-react";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProject(slug);
  return { title: project?.title ?? "Project" };
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        {project.media[0] && (
          <div className="relative aspect-[21/9] bg-gray-100 dark:bg-gray-800">
            <Image src={project.media[0].url} alt={project.title} fill className="object-cover" sizes="800px" />
          </div>
        )}
        <div className="p-6">
          <h1 className="text-3xl font-bold">{project.title}</h1>
          {project.location && (
            <p className="mt-2 flex items-center gap-1 text-gray-500">
              <MapPin className="h-4 w-4" /> {project.location}
            </p>
          )}

          <Link
            href={`/profile/${project.author.profile?.username}`}
            className="mt-4 flex items-center gap-3"
          >
            <Avatar>
              <AvatarImage src={project.author.image ?? undefined} />
              <AvatarFallback>{getInitials(project.author.name ?? "U")}</AvatarFallback>
            </Avatar>
            <span className="font-semibold hover:text-blue-600">{project.author.name}</span>
          </Link>

          <section className="mt-6">
            <h2 className="text-lg font-bold">Overview</h2>
            <p className="mt-2 text-gray-700 dark:text-gray-300">{project.description}</p>
          </section>

          {project.equipment.length > 0 && (
            <section className="mt-6">
              <h2 className="text-lg font-bold">Equipment</h2>
              <ul className="mt-2 space-y-1">
                {project.equipment.map((eq) => (
                  <li key={eq} className="flex gap-2 text-gray-700 dark:text-gray-300">
                    <span className="text-blue-600">•</span> {eq}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {project.media.length > 1 && (
            <section className="mt-6">
              <h2 className="text-lg font-bold">Installation</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {project.media.map((media) => (
                  <div key={media.id} className="relative aspect-video overflow-hidden rounded-xl">
                    <Image src={media.url} alt={media.caption ?? ""} fill className="object-cover" sizes="400px" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {project.challenges && (
            <section className="mt-6 rounded-xl bg-amber-50 p-4 dark:bg-amber-950/30">
              <h2 className="font-bold">Challenges</h2>
              <p className="mt-2 text-gray-700 dark:text-gray-300">{project.challenges}</p>
            </section>
          )}

          {project.solution && (
            <section className="mt-6 rounded-xl bg-green-50 p-4 dark:bg-green-950/30">
              <h2 className="font-bold">Solution</h2>
              <p className="mt-2 text-gray-700 dark:text-gray-300">{project.solution}</p>
            </section>
          )}
        </div>
      </article>
    </div>
  );
}
