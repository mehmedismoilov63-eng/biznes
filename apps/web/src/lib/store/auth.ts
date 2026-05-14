"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type UserProfile = {
  firstName: string;
  lastName: string;
  username: string;
  avatarPath?: string | null;
  businessName?: string | null;
  city?: string | null;
  bio?: string | null;
};

type AuthUser = {
  id: string;
  phone: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  language: string;
  industryId?: string | null;
  sectionId?: string | null;
  profile?: UserProfile | null;
};

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  isOnboarded: boolean;
  setAuth: (user: AuthUser, token: string) => void;
  setUser: (user: AuthUser) => void;
  setOnboarded: () => void;
  logout: () => void;
};

function setSessionCookie(value: string) {
  if (typeof document === "undefined") return;
  document.cookie = `bj_access=${value}; path=/; SameSite=Lax; max-age=${60 * 60 * 24 * 30}`;
}

function clearSessionCookie() {
  if (typeof document === "undefined") return;
  document.cookie = "bj_access=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isOnboarded: false,
      setAuth: (user, accessToken) => {
        setSessionCookie("1");
        // Per-tab isolation: sessionStorage overrides shared localStorage for X-User-Id
        if (typeof sessionStorage !== "undefined") {
          sessionStorage.setItem("bj_uid", user.id);
        }
        set({
          user,
          accessToken,
          isOnboarded: Boolean(user.profile?.firstName && user.industryId && user.sectionId),
        });
      },
      setUser: (user) => set({ user }),
      setOnboarded: () => set({ isOnboarded: true }),
      logout: () => {
        clearSessionCookie();
        if (typeof sessionStorage !== "undefined") {
          sessionStorage.removeItem("bj_uid");
        }
        set({ user: null, accessToken: null, isOnboarded: false });
      },
    }),
    {
      name: "bj_auth",
      onRehydrateStorage: () => (state) => {
        if (state?.user && state?.accessToken) setSessionCookie("1");
      },
    },
  ),
);
