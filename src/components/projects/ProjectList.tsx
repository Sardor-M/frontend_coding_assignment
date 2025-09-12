import type { Project } from "@/types/project";
import ProjectCard from "@/components/projects/ProjectCard";

type ProjectListProps = {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onRenameProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
};

export default function ProjectList({
  projects,
  onSelectProject,
  onRenameProject,
  onDeleteProject,
}: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No projects found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onSelect={() => onSelectProject(project)}
          onRename={() => onRenameProject(project)}
          onDelete={() => onDeleteProject(project)}
        />
      ))}
    </div>
  );
}
