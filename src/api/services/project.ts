import useAxios from "@/hooks/useAxios";
import type {
  Project,
  CreateProjectRequest,
  CreateProjectResponse,
  UpdateProjectRequest,
  DeleteProjectRequest,
  MessageResponse,
} from "@/types/project";

export const useProjectsApi = () => {
  const fetchData = useAxios();

  const getProjects = async () => {
    return fetchData<Project[]>({
      endpoint: "/project",
      method: "GET",
    });
  };

  const createProject = async (data: CreateProjectRequest) => {
    return fetchData<CreateProjectResponse>({
      endpoint: "/project",
      method: "POST",
      data,
    });
  };

  const updateProject = async (data: UpdateProjectRequest) => {
    return fetchData<MessageResponse>({
      endpoint: "/project",
      method: "PATCH",
      data,
    });
  };

  const deleteProject = async (data: DeleteProjectRequest) => {
    return fetchData<MessageResponse>({
      endpoint: "/project",
      method: "DELETE",
      data,
    });
  };

  return {
    getProjects,
    createProject,
    updateProject,
    deleteProject,
  };
};
