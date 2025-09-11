import { atom } from "recoil";

export type ErrorState = {
  title: string;
  message: string;
  record: any;
};

export const errorAtom = atom<ErrorState | null>({
  key: "errorAtom",
  default: null,
});
