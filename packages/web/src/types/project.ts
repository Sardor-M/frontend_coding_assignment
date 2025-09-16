export type Project = {
    id: string;
    name: string;
    createdAt: string;
    uuid: string;
};

export type CreateProjectRequest = {
    name: string;
};

export type CreateProjectResponse = {
    id: string;
};

export type UpdateProjectRequest = {
    id: string;
    name: string;
};

export type DeleteProjectRequest = {
    id: string;
};

export type MessageResponse = {
    message: string;
};
