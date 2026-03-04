"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";

export function SignOutButton() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <button
      className="px-4 py-2 rounded-lg font-semibold transition-all shadow-lg"
      style={{
        background: 'linear-gradient(to right, #facc15, #d97706)',
        color: '#451a03',
      }}
      onClick={() => void signOut()}
    >
      Sign out
    </button>
  );
}