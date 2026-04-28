"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      className="glass-button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await authClient.signOut();
          router.push("/login");
          router.refresh();
        });
      }}
      type="button"
    >
      {pending ? "Signing out" : "Sign out"}
    </button>
  );
}
