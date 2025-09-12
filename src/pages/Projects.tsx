import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { Plus, Search } from "lucide-react";
import { projectsAtom, selectedProjectAtom } from "@/atoms/project";
import Layout from "@/components/layout/Layout";
import ProjectList from "@/components/projects/ProjectList";
import ProjectModal from "@/components/projects/ProjectModal";
import { useProjectsApi } from "@/api";
import type { Project } from "@/types/project";

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useRecoilState(projectsAtom);
  const [, setSelectedProject] = useRecoilState(selectedProjectAtom);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { getProjects, createProject, updateProject, deleteProject } =
    useProjectsApi();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await getProjects();
      setProjects(response.data);
    } catch (error) {
      console.error("Failed to load projects:", error);
      const mockProjects: Project[] = Array.from({ length: 12 }, (_, i) => ({
        id: `project-${i + 1}`,
        name: "Lorem Ipsum Dolor Sit Amet Consectetur Adipiscing Elit Sed",
        createdAt: new Date(2025, 3, 25).toISOString(),
      }));
      setProjects(mockProjects);
    }
  };

  const handleCreateProject = async (name: string) => {
    try {
      const response = await createProject({ name });
      const newProject: Project = {
        id: response.data.id,
        name,
        createdAt: new Date().toISOString(),
      };
      setProjects((prev) => [newProject, ...prev]);
    } catch (error) {
      console.error("Failed to create project:", error);
      const newProject: Project = {
        id: `project-${Date.now()}`,
        name,
        createdAt: new Date().toISOString(),
      };
      setProjects((prev) => [newProject, ...prev]);
    }
  };

  const handleRenameProject = async (name: string) => {
    if (!projectToEdit) return;

    try {
      await updateProject({ id: projectToEdit.id, name });
      setProjects((prev) =>
        prev.map((p) => (p.id === projectToEdit.id ? { ...p, name } : p))
      );
    } catch (error) {
      console.error("Failed to rename project:", error);
      setProjects((prev) =>
        prev.map((p) => (p.id === projectToEdit.id ? { ...p, name } : p))
      );
    }
  };

  const handleDeleteProject = async (project: Project) => {
    if (!confirm(`Are you sure you want to delete "${project.name}"?`)) {
      return;
    }

    try {
      await deleteProject({ id: project.id });
      setProjects((prev) => prev.filter((p) => p.id !== project.id));
    } catch (error) {
      console.error("Failed to delete project:", error);
      setProjects((prev) => prev.filter((p) => p.id !== project.id));
    }
  };

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    navigate(`/chat/${project.id}`);
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <header className="px-1 pt-12 pb-0">
        {" "}
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          {" "}
          <h1 className="text-2xl font-bold">Projects</h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New project
          </button>
        </div>
      </header>

      <div className="px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search project"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="px-6 pb-6">
        <div className="max-w-5xl mx-auto">
          <ProjectList
            projects={filteredProjects}
            onSelectProject={handleSelectProject}
            onRenameProject={(project) => {
              setProjectToEdit(project);
              setIsRenameModalOpen(true);
            }}
            onDeleteProject={handleDeleteProject}
          />
        </div>
      </div>

      <ProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProject}
        title="New Project"
      />

      <ProjectModal
        isOpen={isRenameModalOpen}
        onClose={() => {
          setIsRenameModalOpen(false);
          setProjectToEdit(null);
        }}
        onSubmit={handleRenameProject}
        title="Rename Project"
        project={projectToEdit}
      />
    </Layout>
  );
}
