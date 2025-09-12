import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import { HomeIcon } from "lucide-react";
import {
  messagesAtom,
  projectsAtom,
  selectedProjectAtom,
} from "@/atoms/project";
import ChatInterface from "@/components/chat/ChatIInterface";
import Layout from "@/components/layout/Layout";

export default function ChatPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const projects = useRecoilValue(projectsAtom);
  const [selectedProject, setSelectedProject] =
    useRecoilState(selectedProjectAtom);
  const [, setMessages] = useRecoilState(messagesAtom);

  useEffect(() => {
    if (projectId) {
      const project = projects.find((p) => p.id === projectId);
      if (project) {
        setSelectedProject(project);
      } else {
        navigate("/");
      }
    }
  }, [projectId, projects, setSelectedProject, navigate]);

  const handleBack = () => {
    setSelectedProject(null);
    setMessages([]);
    navigate("/");
  };

  if (!selectedProject) {
    return null;
  }

  return (
    <Layout>
      <header className="px-6 py-4 bg-white">
        <div className="flex items-center gap-2">
          <button
            onClick={handleBack}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors"
          >
            <HomeIcon className="w-4 h-4" />
          </button>
          <span className="font-small text-gray-800">
            {selectedProject.name}
          </span>
        </div>
      </header>
      <div className="h-[calc(100vh-73px)]">
        <ChatInterface />
      </div>
    </Layout>
  );
}
