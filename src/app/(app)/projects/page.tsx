import Link from "next/link";
import Image from "next/image";
import { getProjects } from "@/lib/queries";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";
import { MapPin } from "lucide-react";

export const metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="animate-fade-in">
      <h1 className="mb-2 text-2xl font-bold">📋 Projects</h1>
      <p className="mb-6 text-gray-500">Complete installation portfolios from the community</p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.slug}`}
            className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition-shadow hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
              {project.media[0] && (
                <Image
                  src={project.media[0].url}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="400px"
                />
              )}
            </div>
            <div className="p-5">
              <h3 className="font-bold group-hover:text-blue-600">{project.title}</h3>
              {project.location && (
                <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                  <MapPin className="h-3.5 w-3.5" /> {project.location}
                </p>
              )}
              <p className="mt-2 text-sm text-gray-600 line-clamp-2 dark:text-gray-400">
                {project.description}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={project.author.image ?? undefined} />
                  <AvatarFallback className="text-[10px]">
                    {getInitials(project.author.name ?? "U")}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-500">{project.author.name}</span>
              </div>
              {project.equipment.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {project.equipment.slice(0, 3).map((eq) => (
                    <Badge key={eq} variant="outline" className="text-xs">{eq}</Badge>
                  ))}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
