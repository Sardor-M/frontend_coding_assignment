import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import type { Project } from "@/types/project";
import { Input } from "@/components/ui/Input";

type ProjectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
  title: string;
  project?: Project | null;
};

export default function ProjectModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  project,
}: ProjectModalProps) {
  const [projectName, setProjectName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (project) {
      setProjectName(project.name);
    } else {
      setProjectName("");
    }
    setError("");
  }, [project, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectName.trim()) {
      setError("Project name is required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await onSubmit(projectName.trim());
      setProjectName("");
      onClose();
    } catch (err) {
      setError("Failed to save project. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Project name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          error={error}
          autoFocus
        />
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
            disabled={!projectName.trim()}
          >
            Accept
          </Button>
        </div>
      </form>
    </Modal>
  );
}
