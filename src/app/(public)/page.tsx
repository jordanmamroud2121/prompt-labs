"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { navigationItems, authNavigationItems } from "@/config/navigation";
import { APP_NAME, APP_DESCRIPTION } from "@/config/constants";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to dashboard if authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  // Don't render anything if loading or authenticated (will redirect)
  if (isLoading || isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          {APP_NAME}
        </p>
      </div>

      <div className="flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-4">{APP_NAME}</h1>
        <p className="text-xl mb-8">{APP_DESCRIPTION}</p>

        <div className="grid gap-4">
          <div className="flex gap-4">
            {authNavigationItems.map((item) => (
              <Button key={item.name} asChild>
                <Link href={item.href}>{item.name}</Link>
              </Button>
            ))}
          </div>

          <div className="flex gap-4 mt-4">
            {navigationItems
              .filter((item) => !item.requiresAuth)
              .map((item) => (
                <Button key={item.name} variant="outline" asChild>
                  <Link href={item.href}>{item.name}</Link>
                </Button>
              ))}
          </div>
        </div>
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-3 lg:text-left mt-16">
        <Link
          href="/login"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            Login{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              &rarr;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Sign in to your account
          </p>
        </Link>

        <Link
          href="/signup"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            Sign Up{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              &rarr;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Create a new account
          </p>
        </Link>

        <Link
          href="https://ui.shadcn.com/"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            ShadCN UI{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              &rarr;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Explore the UI components
          </p>
        </Link>
      </div>
    </main>
  );
}
