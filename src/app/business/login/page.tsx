"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";
import { sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { auth, ensureFirebaseConfigured } from "@/lib/firebase";

export default function BusinessLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setResetSuccess(null);
    setLoading(true);

    try {
      ensureFirebaseConfigured();

      if (!auth) {
        throw new Error("Firebase authentication is not available.");
      }

      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.push("/dashboard");
    } catch (err: unknown) {
      if (
        err instanceof FirebaseError &&
        ["auth/invalid-credential", "auth/wrong-password", "auth/user-not-found"].includes(
          err.code
        )
      ) {
        setError("Invalid email or password. Please check your credentials.");
      } else if (err instanceof FirebaseError && err.code === "auth/too-many-requests") {
        setError(
          "Account temporarily locked due to multiple failed attempts. Try again later or reset your password."
        );
      } else {
        setError("Failed to sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const businessEmail = email.trim();
    setError(null);
    setResetSuccess(null);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(businessEmail)) {
      setError("Please enter your business email address first.");
      return;
    }

    setIsResetting(true);
    try {
      ensureFirebaseConfigured();

      if (!auth) {
        throw new Error("Firebase authentication is not available.");
      }

      await sendPasswordResetEmail(auth, businessEmail);
      setError(null);
      setResetSuccess("Password reset link sent! Please check your inbox (and junk/spam folder).");
    } catch (err: unknown) {
      if (err instanceof FirebaseError && err.code === "auth/user-not-found") {
        setError("No registered business account exists with this email address.");
      } else if (err instanceof FirebaseError && err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError("Unable to send reset email. Please verify the email address and try again.");
      }
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 via-white to-sky-50 text-slate-900">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-lg shadow-sky-100 sm:p-10">
          <div className="mx-auto flex w-fit rounded-2xl bg-white p-2">
            <Image
              src="/images/logo/logo.jpg"
              alt="Explore Kid Logo"
              width={140}
              height={60}
              className="h-12 w-auto object-contain"
            />
          </div>

          <h1 className="mt-6 text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            ExploreKid Business Portal
          </h1>
          <p className="mt-2 text-center text-sm leading-6 text-slate-600 sm:text-base">
            Log in to manage your listings, events, and business profile.
          </p>

          <form className="mt-8 space-y-5" noValidate onSubmit={handleLogin}>
            {error ? (
              <div
                role="alert"
                className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
              >
                {error}
              </div>
            ) : null}
            {resetSuccess ? (
              <div
                role="status"
                className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"
              >
                {resetSuccess}
              </div>
            ) : null}
            <div>
              <label
                htmlFor="businessEmail"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Business Email Address
              </label>
              <input
                id="businessEmail"
                name="businessEmail"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                placeholder="you@yourbusiness.com"
                disabled={loading || isResetting}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                placeholder="Enter your password"
                disabled={loading || isResetting}
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={loading || isResetting}
                className="text-sm font-semibold text-sky-700 transition hover:text-sky-900 hover:underline"
              >
                {isResetting ? "Sending reset link..." : "Forgot Password?"}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || isResetting}
              className="inline-flex w-full items-center justify-center rounded-xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Logging in..." : "Log In to Business Portal"}
            </button>
            <p className="text-center text-xs text-slate-400">
              Secure 256-bit SSL encrypted connection
            </p>
          </form>

          <p className="mt-5 text-center text-sm text-slate-600">
            New business?{" "}
            <Link
              href="/business/signup"
              className="font-semibold text-sky-700 transition hover:text-sky-900 hover:underline"
            >
              Register here
            </Link>
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 border-t border-slate-200 pt-5 text-sm text-slate-600">
            <Link href="/terms" className="transition hover:text-slate-900 hover:underline">
              Terms
            </Link>
            <Link href="/privacy" className="transition hover:text-slate-900 hover:underline">
              Privacy
            </Link>
            <Link href="/support" className="transition hover:text-slate-900 hover:underline">
              Support
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
