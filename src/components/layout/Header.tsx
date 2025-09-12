import React from "react";
import { ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";

type HeaderProps = {
  title: string;
  showBackButton?: boolean;
  onBack?: () => void;
  action?: React.ReactNode;
};

export default function Header({
  title,
  showBackButton,
  onBack,
  action,
}: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBackButton && onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
              Back
            </Button>
          )}
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
        {action && <div>{action}</div>}
      </div>
    </header>
  );
}
