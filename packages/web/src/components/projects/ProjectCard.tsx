import { useState } from "react";
import { MoreVertical, User, Edit2, Trash2 } from "lucide-react";
import Card from "@/components/ui/Card";
import type { Project } from "@/types/project";
import { formatDate } from "@/utils/formatter";

type ProjectCardProps = {
  project: Project;
  onSelect: () => void;
  onRename: () => void;
  onDelete: () => void;
};

export default function ProjectCard({
  project,
  onSelect,
  onRename,
  onDelete,
}: ProjectCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <Card onClick={onSelect}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-900 line-clamp-2">
          {project.name}
        </h3>
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <MoreVertical className="w-4 h-4 text-gray-500" />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-1 w-36 bg-white rounded-md shadow-lg border border-gray-200 z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRename();
                  setShowMenu(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50"
              >
                <Edit2 className="w-3 h-3" />
                Rename
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                  setShowMenu(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 text-red-600"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <User className="w-3 h-3" />
        <span>John Doe</span>
      </div>
      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
        <span>{formatDate(project.createdAt)}</span>
      </div>
    </Card>
  );
}
