"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import DevModeIndicator from "@/components/common/DevModeIndicator";
import { PromptProvider } from "@/context/PromptContext";
import { TemplateProvider } from "@/context/TemplateContext";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Show loading state or children depending on auth state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Don't render anything while redirecting
  }

  return (
    <>
      <TemplateProvider>
        <PromptProvider>{children}</PromptProvider>
      </TemplateProvider>
      {process.env.NODE_ENV === "development" && <DevModeIndicator />}
    </>
  );
}
