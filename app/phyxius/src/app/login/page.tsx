import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Sign in — MosiMosi",
  description: "Welcome back to MosiMosi.",
};

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  // Never keep credentials in the address bar / server logs via query string.
  if ("email" in params || "password" in params) {
    redirect("/login");
  }

  const session = await getSession();

  if (session) {
    redirect("/");
  }

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-[var(--bg)] text-[var(--ink)] lg:flex-row">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(80% 60% at 18% 20%, var(--paper-glow), transparent 55%),
            radial-gradient(55% 45% at 85% 75%, color-mix(in srgb, var(--accent) 10%, transparent), transparent 50%),
            linear-gradient(165deg, var(--bg) 0%, var(--bg-deep) 100%)
          `,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.3] mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E")`,
          backgroundSize: "180px 180px",
        }}
      />

      <section className="relative z-10 flex min-h-[42vh] flex-1 flex-col justify-between px-6 py-8 sm:px-10 sm:py-10 lg:min-h-dvh lg:border-r lg:border-[var(--line)] lg:px-14 lg:py-12 xl:px-16">
        <Link
          href="/"
          className="landing-fade w-fit font-serif text-2xl leading-none tracking-[-0.02em] text-[var(--ink)] transition-opacity hover:opacity-70 sm:text-3xl"
        >
          MosiMosi
        </Link>

        <h1 className="landing-rise landing-delay-1 max-w-md py-12 font-serif text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.96] tracking-[-0.02em] text-[var(--ink)] lg:py-0">
          Welcome
          <br />
          back.
        </h1>

        <p className="landing-fade landing-delay-2 max-w-xs text-sm leading-relaxed text-[var(--muted)] sm:text-[15px]">
          Every case, every round, right where you left it.
        </p>
      </section>

      <section className="relative z-10 flex flex-1 items-center px-6 py-10 sm:px-10 lg:min-h-dvh lg:px-14 xl:px-16">
        <div className="landing-rise landing-delay-2 w-full max-w-md">
          <LoginForm />
        </div>
      </section>
    </div>
  );
}
