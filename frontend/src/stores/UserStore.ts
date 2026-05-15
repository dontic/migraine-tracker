import { create } from "zustand";

import type { User } from "@/api/django/djangoAPI.schemas";

interface UserStore {
  user: User | undefined;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: undefined,
  setUser: (user) =>
    set({
      user: {
        ...user
      }
    }),
  clearUser: () => set({ user: undefined })
}));
