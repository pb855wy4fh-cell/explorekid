"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, serverTimestamp, writeBatch } from "firebase/firestore";
import { auth, db, ensureFirebaseConfigured } from "@/lib/firebase";

type Tier = "free" | "paid";

export default function BusinessOnboardingPage() {
  const router = useRouter();
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      ensureFirebaseConfigured();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Firebase is not configured.");
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/business/login");
        return;
      }

      try {
        const userSnapshot = await getDoc(doc(db, "business_users", user.uid));
        const storedBusinessId = userSnapshot.data()?.businessId;

        if (typeof storedBusinessId !== "string") {
          setError("We could not find your business registration. Please contact support.");
        } else {
          setBusinessId(storedBusinessId);
        }
      } catch {
        setError("Unable to load your business registration. Please try again.");
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [router]);

  const selectTier = async (tier: Tier) => {
    const user = auth.currentUser;

    if (!user || !businessId) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const batch = writeBatch(db);
      batch.update(doc(db, "businesses", businessId), {
        tier,
        updatedAt: serverTimestamp(),
      });
      batch.update(doc(db, "business_users", user.uid), {
        onboardingStatus: "profile_pending",
      });
      await batch.commit();
      router.push("/business/onboarding/profile");
    } catch (err: unknown) {
      if (err instanceof FirebaseError && err.code === "permission-denied") {
        setError("You do not have permission to update this business.");
      } else {
        setError("Unable to save your tier selection. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 via-white to-sky-50 text-slate-900">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-lg shadow-sky-100 sm:p-10">
          <div className="mx-auto flex w-fit rounded-2xl bg-white p-2">
            <Image
              src="/images/logo/logo.jpg"
              alt="Explore Kid Logo"
              width={140}
              height={60}
              className="h-12 w-auto object-contain"
            />
          </div>

          <>
              <h1 className="mt-6 text-center text-2xl font-bold text-slate-900 sm:text-3xl">
                Choose Your Business Tier
              </h1>
              <p className="mt-2 text-center text-sm leading-6 text-slate-600 sm:text-base">
                Select the plan that fits your business. Your listing will then be submitted for
                approval.
              </p>

              {error ? (
                <div
                  role="alert"
                  className="mt-6 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
                >
                  {error}
                </div>
              ) : null}

              {loading ? (
                <p className="mt-8 text-center text-sm text-slate-600">Loading your registration...</p>
              ) : (
                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => selectTier("free")}
                    disabled={!businessId || submitting}
                    className="rounded-xl border-2 border-sky-200 p-6 text-left transition hover:border-sky-500 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <span className="block text-lg font-bold text-slate-900">Free Tier</span>
                    <span className="mt-2 block text-sm leading-6 text-slate-600">
                      Establish your business presence with an approved listing.
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => selectTier("paid")}
                    disabled={!businessId || submitting}
                    className="rounded-xl border-2 border-rose-200 p-6 text-left transition hover:border-rose-500 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <span className="block text-lg font-bold text-slate-900">Paid Tier</span>
                    <span className="mt-2 block text-sm leading-6 text-slate-600">
                      Choose enhanced visibility for your business after approval.
                    </span>
                  </button>
                </div>
              )}

              {submitting ? (
                <p className="mt-5 text-center text-sm text-slate-600">Saving your selection...</p>
              ) : null}
          </>
        </div>
      </section>
    </main>
  );
}