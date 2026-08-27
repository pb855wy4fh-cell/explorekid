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
    <main className="min-h-screen bg-gradient-to-b from-sky-100 via-sky-50 to-amber-50 text-slate-900">
      <header className="border-b border-sky-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center">
            <Image
              src="/images/logo/logo.jpg"
              alt="Explore Kid Logo"
              width={140}
              height={60}
              className="h-12 w-auto object-contain"
            />
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/business/login"
              className="text-sm font-semibold text-sky-700 underline decoration-sky-300 decoration-2 underline-offset-4 transition hover:text-sky-900"
            >
              For Businesses
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="rounded-3xl border border-white/80 bg-white/70 p-8 shadow-lg shadow-sky-100 backdrop-blur md:p-12">
          <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
            <div className="rounded-2xl bg-white p-3 shadow-lg shadow-sky-100">
              <Image
                src="/images/logo/logo.jpg"
                alt="Explore Kid Logo"
                width={140}
                height={60}
                className="h-12 w-auto object-contain"
              />
            </div>

            <span className="mt-6 inline-flex items-center rounded-full bg-amber-400 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-amber-950">
              Discover. Connect. Grow.
            </span>

            <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              <span className="text-rose-500">Explore</span>{" "}
              <span className="text-sky-600">Kid</span>{" "}
              <span className="text-slate-900">
                connects families with local kid-friendly activities.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-700 sm:text-lg">
              Parents discover trusted camps, classes, events, and play spaces
              in one place. Local businesses reach the right families, build
              visibility, and grow with confidence.
            </p>

            <div className="mt-10 flex w-full flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="https://apps.apple.com/us/app/brevard-kid/id6746275543"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-w-[220px] items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-white shadow-lg transition hover:bg-black"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-6 w-6 fill-current"
                >
                  <path d="M16.365 12.733c.01-2.023 1.65-2.995 1.726-3.041-.946-1.381-2.418-1.571-2.933-1.593-1.247-.126-2.438.734-3.074.734-.636 0-1.618-.715-2.66-.695-1.368.02-2.63.795-3.334 2.025-1.422 2.466-.362 6.118 1.022 8.118.677.977 1.485 2.076 2.546 2.036 1.021-.041 1.406-.661 2.639-.661 1.233 0 1.579.661 2.659.64 1.1-.02 1.796-.998 2.468-1.978.776-1.132 1.095-2.229 1.114-2.286-.024-.01-2.137-.82-2.173-3.299z" />
                  <path d="M14.61 4.954c.563-.682.943-1.629.839-2.574-.812.033-1.796.54-2.379 1.221-.522.604-.978 1.567-.855 2.491.905.07 1.832-.461 2.395-1.138z" />
                </svg>
                <span className="flex flex-col items-start leading-tight">
                  <span className="text-[11px] font-medium text-slate-300">Download on the</span>
                  <span className="text-base font-semibold">App Store</span>
                </span>
              </a>

              <a
                href="https://play.google.com/store/apps/details?id=com.brevardkidllc.android&hl=en-US"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-w-[220px] items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-white shadow-lg transition hover:bg-black"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-6 w-6"
                >
                  <path fill="#34A853" d="M3.9 2.5l10.7 10.7-10.7 10.3c-.5-.3-.8-.8-.8-1.4V3.9c0-.6.3-1.1.8-1.4z" />
                  <path fill="#EA4335" d="M17.9 10.5l2.2 1.3c1 .6 1 2 0 2.6l-2.2 1.3-2.7-2.5 2.7-2.7z" />
                  <path fill="#FBBC04" d="M3.9 23.5l10.7-10.3 3.3 2.5-11.9 7c-.7.4-1.5.5-2.1.8z" />
                  <path fill="#4285F4" d="M3.9 2.5c.6.2 1.4.4 2.1.8l11.9 7-3.3 2.9L3.9 2.5z" />
                </svg>
                <span className="flex flex-col items-start leading-tight">
                  <span className="text-[11px] font-medium text-slate-300">Get it on</span>
                  <span className="text-base font-semibold">Google Play</span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-sky-200/70 bg-white/70">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-sky-700 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span>© {new Date().getFullYear()} Explore Kid App. All rights reserved.</span>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/terms" className="hover:text-sky-900 hover:underline">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-sky-900 hover:underline">
              Privacy Policy
            </Link>
            <Link href="/support" className="hover:text-sky-900 hover:underline">
              Support
            </Link>
            <Link href="/business" className="hover:text-sky-900 hover:underline">
              Business Portal
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}