import React from "react";
import { cn } from "@/utils/cn";

type CardProps = {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
};

export default function Card({ className, children, onClick }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-lg border border-gray-200 p-4",
        "hover:shadow-md transition-shadow",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
