"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Network, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginPageClient() {
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
      callbackUrl: searchParams.get("callbackUrl") ?? "/",
    });

    setLoading(false);

    if (result?.error) {
      setError("Identifiant ou mot de passe incorrect");
      return;
    }

    window.location.href = result?.url ?? "/";
  }

  return (
    <div className="mesh-bg relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute top-1/4 left-1/4 size-2 rounded-full bg-brand signal-dot" />
        <div
          className="absolute top-1/3 right-1/3 size-1.5 rounded-full bg-primary signal-dot"
          style={{ animationDelay: "0.6s" }}
        />
        <div
          className="absolute bottom-1/3 left-1/2 size-1.5 rounded-full bg-brand signal-dot"
          style={{ animationDelay: "1.2s" }}
        />
      </div>

      <Card className="glass-card relative w-full max-w-md animate-scale-in border-primary/15 shadow-xl shadow-primary/5">
        <CardHeader className="text-center">
          <div className="logo-pulse mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-brand text-primary-foreground shadow-lg shadow-primary/25">
            <Network className="size-7 animate-float" />
          </div>
          <CardTitle className="font-heading text-2xl">
            <span className="gradient-text">Ressources Telecom</span>
          </CardTitle>
          <CardDescription className="animate-fade-in stagger-2 flex items-center justify-center gap-1.5">
            <Radio className="size-3.5 text-brand" />
            Connecte-toi pour accéder à ton hub
          </CardDescription>
        </CardHeader>
        <CardContent className="animate-fade-in-up stagger-3">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Identifiant</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                className="h-10 transition-shadow duration-200 focus-visible:shadow-[0_0_0_3px_oklch(0.68_0.1_240/0.22)]"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="h-10 transition-shadow duration-200 focus-visible:shadow-[0_0_0_3px_oklch(0.68_0.1_240/0.22)]"
                required
              />
            </div>
            {error ? (
              <p className="animate-fade-in text-sm text-destructive">{error}</p>
            ) : null}
            <Button
              type="submit"
              className="btn-shine h-11 w-full bg-gradient-to-r from-primary to-brand text-base"
              disabled={loading}
            >
              {loading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
