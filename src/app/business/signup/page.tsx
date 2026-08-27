"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function BusinessSignupPage() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!businessName.trim() || !contactName.trim() || !email.trim() || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const credentials = await createUserWithEmailAndPassword(auth, email, password);
      const user = credentials.user;
      const businessId = Date.now().toString();
      const batch = writeBatch(db);

      batch.set(doc(db, "business_users", user.uid), {
        fullName: contactName.trim(),
        business_name: businessName.trim(),
        email,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        businessId,
        role: "business",
        status: "active",
        onboardingStatus: "tier_pending",
      });

      batch.set(doc(db, "businesses", businessId), {
        businessId,
        businessName: businessName.trim(),
        ownerId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        approvalStatus: "under_review",
        tier: "",
      });

      await batch.commit();
      router.push("/business/onboarding");
    } catch (err: unknown) {
      console.error("Signup Error:", err);

      if (err instanceof FirebaseError) {
        if (err.code === "auth/email-already-in-use") {
          setError("An account with this email address already exists.");
        } else if (err.code === "auth/weak-password") {
          setError("Password should be at least 6 characters.");
        } else if (err.code === "permission-denied") {
          setError(
            "Firestore write permission denied. Check your Firestore Security Rules."
          );
        } else {
          setError(err.message);
        }
      } else {
        setError("Unable to complete registration. Please try again.");
      }
    } finally {
      setLoading(false);
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
            Register Your Business
          </h1>
          <p className="mt-2 text-center text-sm leading-6 text-slate-600 sm:text-base">
            Create your business account to submit your profile for admin approval.
          </p>

          {error ? (
            <div className="mt-6 rounded-lg bg-rose-50 p-3 text-sm text-rose-600">{error}</div>
          ) : null}

          <form className="mt-6 space-y-5" noValidate onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="businessName"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Business Name
              </label>
              <input
                id="businessName"
                name="businessName"
                type="text"
                value={businessName}
                onChange={(event) => setBusinessName(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                placeholder="Your business name"
                disabled={loading}
              />
            </div>

            <div>
              <label
                htmlFor="contactName"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Contact Name
              </label>
              <input
                id="contactName"
                name="contactName"
                type="text"
                value={contactName}
                onChange={(event) => setContactName(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                placeholder="Primary contact"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                placeholder="you@yourbusiness.com"
                disabled={loading}
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
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                placeholder="Create a password"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Creating account..." : "Register Business Account"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-600">
            Already registered?{" "}
            <Link
              href="/business/login"
              className="font-semibold text-sky-700 transition hover:text-sky-900 hover:underline"
            >
              Log in here
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
