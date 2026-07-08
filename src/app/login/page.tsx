import { Suspense } from "react";
import { LoginPageClient } from "@/components/pages/login-page";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LoginPageClient />
    </Suspense>
  );
}
