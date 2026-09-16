import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Explore Kid App | Family Activities and Business Growth",
  description:
    "Explore Kid connects families with local kid-friendly activities and helps businesses reach parents.",
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50 text-slate-900">
      <header className="border-b border-sky-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="overflow-hidden rounded-full border border-sky-200 bg-white p-1 shadow-sm">
              <Image
                src="/images/logo/logo.jpg"
                alt="Explore Kid Logo"
                width={48}
                height={48}
                className="h-12 w-12 rounded-full object-cover"
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">Explore Kid</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/auth/signin"
              className="inline-flex items-center rounded-full border border-sky-200 bg-white px-4 py-2 text-sm font-semibold text-sky-700 transition hover:border-sky-300 hover:text-sky-900"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="inline-flex items-center rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
            >
              Business Sign Up
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <span className="inline-flex items-center rounded-full bg-amber-100 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-amber-800">
              Discover. Connect. Grow.
            </span>

            <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Explore Kid helps families find local fun and helps businesses reach the right parents.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-700">
              Explore Kid connects parents with trusted kid-friendly activities, classes, events, and local businesses in their area. It gives businesses a simple way to grow visibility, attract families, and build lasting community relationships.
            </p>

            <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row">
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center rounded-full bg-sky-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-sky-700"
              >
                Register Your Business
              </Link>
              <Link
                href="/business/login"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
              >
                Business Portal Login
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-xl shadow-sky-100">
            <div className="rounded-2xl bg-sky-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Family reach</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">25k+</p>
                </div>
                <div className="rounded-2xl bg-sky-600 p-3 text-white">
                  <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true">
                    <path d="M12 2a7 7 0 0 1 7 7c0 4.11-4.34 9.02-6.34 11.41a1 1 0 0 1-1.32 0C9.34 18.02 5 13.11 5 9a7 7 0 0 1 7-7Zm0 9.5A2.5 2.5 0 1 0 12 6a2.5 2.5 0 0 0 0 5.5Z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {[
                { label: "Nearby activities", value: "4,200+" },
                { label: "Active businesses", value: "860" },
                { label: "Parent bookings", value: "91%" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <span className="text-sm font-medium text-slate-600">{item.label}</span>
                  <span className="text-base font-bold text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-sky-100 bg-white/80">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Explore Kid App. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/business/login" className="hover:text-sky-700 hover:underline">
              Business Portal
            </Link>
            <Link href="/auth/signin" className="hover:text-sky-700 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}