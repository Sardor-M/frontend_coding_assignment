import { atom } from "recoil";
import type { Project } from "@/types/project";
import type { ChatMessage } from "@/types/chat";

export const projectsAtom = atom<Project[]>({
  key: "projectsAtom",
  default: [],
});

export const selectedProjectAtom = atom<Project | null>({
  key: "selectedProjectAtom",
  default: null,
});

export const searchQueryAtom = atom<string>({
  key: "searchQueryAtom",
  default: "",
});

export const messagesAtom = atom<ChatMessage[]>({
  key: "messagesAtom",
  default: [],
});

export const isStreamingAtom = atom<boolean>({
  key: "isStreamingAtom",
  default: false,
});
