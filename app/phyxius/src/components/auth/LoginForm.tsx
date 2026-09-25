"use client";

import { FormEvent, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    // Clear credentials that may have leaked into the URL via a prior GET submit.
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (url.searchParams.has("email") || url.searchParams.has("password")) {
      url.search = "";
      window.history.replaceState({}, "", url.pathname);
    }
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "")
      .trim()
      .toLowerCase();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    startTransition(async () => {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message || "Invalid email or password.");
        return;
      }

      router.replace("/");
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      method="post"
      className="flex w-full flex-col gap-10"
      noValidate
      autoComplete="on"
    >
      <div className="flex flex-col gap-8">
        <label className="auth-field group block">
          <span className="mb-3 block text-[11px] font-medium tracking-[0.16em] uppercase text-[var(--muted)]">
            Email
          </span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            placeholder="you@school.edu"
            disabled={pending}
            className="w-full border-0 border-b border-[var(--line)] bg-transparent pb-3 font-serif text-lg text-[var(--ink)] outline-none transition-[border-color] placeholder:text-[var(--muted)] focus:border-[var(--accent)] disabled:opacity-60"
          />
        </label>

        <label className="auth-field group block">
          <span className="mb-3 block text-[11px] font-medium tracking-[0.16em] uppercase text-[var(--muted)]">
            Password
          </span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            minLength={8}
            placeholder="••••••••"
            disabled={pending}
            className="w-full border-0 border-b border-[var(--line)] bg-transparent pb-3 font-serif text-lg tracking-[0.12em] text-[var(--ink)] outline-none transition-[border-color] placeholder:tracking-[0.2em] placeholder:text-[var(--muted)] focus:border-[var(--accent)] disabled:opacity-60"
          />
        </label>
      </div>

      {error ? (
        <p
          role="alert"
          className="text-sm leading-relaxed text-[var(--accent)]"
        >
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-[var(--accent)] px-7 py-3 text-sm font-medium text-[#1a1714] transition-[background-color,transform,opacity] hover:bg-[var(--accent-soft)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
        <button
          type="button"
          disabled
          title="Password reset is not configured yet"
          className="text-sm text-[var(--muted)] underline underline-offset-4 opacity-50"
        >
          Forgot password?
        </button>
      </div>
    </form>
  );
}
