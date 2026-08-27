import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Explore Kid Business | Reach Local Families",
  description:
    "Business portal for local activity providers to manage listings, publish events, and grow visibility with families.",
};

const features = [
  {
    title: "Manage Listings",
    description:
      "Create and update your business profile, services, schedules, and location details in one streamlined dashboard.",
  },
  {
    title: "Publish Events",
    description:
      "Promote classes, camps, workshops, and special events to parents actively searching for local activities.",
  },
  {
    title: "Grow Visibility",
    description:
      "Reach nearby families, build trust with verified details, and increase bookings with a stronger local presence.",
  },
];

export default function BusinessLandingPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo/logo.jpg"
              alt="Explore Kid Logo"
              width={140}
              height={60}
              className="h-12 w-auto object-contain"
            />
            <span className="inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-sky-700">
              Business Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/business/login"
              className="text-sm font-semibold text-sky-700 transition hover:text-sky-900"
            >
              Log In
            </Link>
            <Link
              href="/business/signup"
              className="inline-flex items-center justify-center rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600"
            >
              Register Your Business
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm md:p-12">
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Reach local families and grow your kid-focused business.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Explore Kid helps your business stand out to parents searching for trusted,
            engaging activities. Manage your presence, share your offerings, and connect
            with families in your community.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/business/signup"
              className="inline-flex items-center justify-center rounded-xl bg-rose-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-600"
            >
              Register Your Business
            </Link>
            <Link
              href="/business/login"
              className="inline-flex items-center justify-center rounded-xl bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-600"
            >
              Business Portal Login
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-slate-900">{feature.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
