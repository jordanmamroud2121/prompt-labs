import { redirect } from "next/navigation";

// Root path redirector
export default function RootRedirect() {
  redirect("/dashboard");
} 