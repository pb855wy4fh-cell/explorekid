"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { auth, db, ensureFirebaseConfigured } from "@/lib/firebase";

type ApprovalStatus = "under_review" | "approved" | "rejected";
type Tier = "free" | "paid" | "";

type BusinessDoc = {
  businessName?: string;
  logoUrl?: string;
  location?: string;
  tier?: Tier;
  approvalStatus?: ApprovalStatus;
  email?: string;
  phone?: string;
  viewsCount?: number;
  isPaid?: boolean;
};

type BusinessEvent = {
  id: string;
  title: string;
  description?: string;
  date?: string;
  createdAt?: Timestamp;
};

const STATUS_STYLES: Record<ApprovalStatus, { label: string; className: string }> = {
  under_review: { label: "Under Review", className: "border-amber-200 bg-amber-50 text-amber-700" },
  approved: { label: "Approved", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  rejected: { label: "Rejected", className: "border-rose-200 bg-rose-50 text-rose-700" },
};

// Determines the max active events allowed; null means unlimited.
function getEventLimit(business: BusinessDoc): number | null {
  if (business.approvalStatus === "rejected") return 0;
  if (business.approvalStatus === "under_review") return 3;
  if (business.tier === "paid" && business.isPaid) return null;
  return 3;
}

export default function BusinessDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [business, setBusiness] = useState<BusinessDoc | null>(null);
  const [events, setEvents] = useState<BusinessEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

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
          setLoading(false);
          return;
        }

        setBusinessId(storedBusinessId);
      } catch {
        setError("Unable to load your business account. Please try again.");
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [router]);

  useEffect(() => {
    if (!businessId) return;

    const unsubscribeBusiness = onSnapshot(
      doc(db, "businesses", businessId),
      (snapshot) => {
        setBusiness(snapshot.data() as BusinessDoc | undefined ?? null);
        setLoading(false);
      },
      () => {
        setError("Unable to load your business profile. Please try again.");
        setLoading(false);
      }
    );

    const unsubscribeEvents = onSnapshot(
      query(collection(db, "businesses", businessId, "events"), orderBy("createdAt", "desc")),
      (snapshot) => {
        setEvents(
          snapshot.docs.map((eventDoc) => ({ id: eventDoc.id, ...(eventDoc.data() as Omit<BusinessEvent, "id">) }))
        );
      }
    );

    return () => {
      unsubscribeBusiness();
      unsubscribeEvents();
    };
  }, [businessId]);

  const eventLimit = useMemo(() => (business ? getEventLimit(business) : 3), [business]);
  const eventLimitReached = eventLimit !== null && events.length >= eventLimit;

  const handleCreateEvent = async (formEvent: FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();

    if (!businessId || !eventTitle.trim() || !eventDate) {
      setCreateError("Please provide an event title and date.");
      return;
    }

    if (eventLimitReached) {
      setCreateError("You have reached your event creation limit.");
      return;
    }

    setCreateError(null);
    setCreating(true);

    try {
      await addDoc(collection(db, "businesses", businessId, "events"), {
        title: eventTitle.trim(),
        description: eventDescription.trim(),
        date: eventDate,
        createdAt: serverTimestamp(),
      });
      setEventTitle("");
      setEventDescription("");
      setEventDate("");
      setShowCreateForm(false);
    } catch {
      setCreateError("Unable to create your event. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-600">Loading your business portal...</main>;
  }

  if (error || !business) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-center text-sm text-rose-600">
        {error ?? "We could not load your business profile."}
      </main>
    );
  }

  const status: ApprovalStatus = business.approvalStatus ?? "under_review";
  const statusStyle = STATUS_STYLES[status];
  const showPaymentBanner = business.tier === "paid" && status === "approved";

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 via-white to-sky-50 text-slate-900">
      <section className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Business Dashboard</h1>
          <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusStyle.className}`}>
            {statusStyle.label}
          </span>
        </div>

        {/* Business Profile Overview */}
        <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Image
              src={business.logoUrl || "/images/logo/logo.jpg"}
              alt={`${business.businessName ?? "Business"} logo`}
              width={64}
              height={64}
              className="h-16 w-16 rounded-xl border border-slate-200 object-cover"
            />
            <div>
              <p className="text-lg font-bold text-slate-900">{business.businessName || "Your Business"}</p>
              <p className="text-sm text-slate-600">{business.location || "Location not set"}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-sky-700">
                {business.tier ? `${business.tier} tier` : "Tier not selected"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {business.email || "No email on file"} {business.phone ? `• ${business.phone}` : ""}
              </p>
            </div>
          </div>
          <Link
            href="/business/onboarding/profile"
            className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
          >
            Edit Profile
          </Link>
        </div>

        {/* Analytics */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-600">Profile Views</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{business.viewsCount ?? 0}</p>
            <p className="mt-1 text-xs text-slate-500">Total times families have viewed your listing.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-600">Active Events</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {events.length}
              {eventLimit !== null ? <span className="text-base font-medium text-slate-400"> / {eventLimit}</span> : null}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {eventLimit === null ? "Unlimited events unlocked." : "Events allowed at your current status."}
            </p>
          </div>
        </div>

        {/* Payment Banner */}
        {showPaymentBanner ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
            {business.isPaid ? (
              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Paid / Active Premium
              </span>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-rose-800">
                  Complete your payment to unlock featured perks and unlimited events.
                </p>
                <Link
                  href={process.env.NEXT_PUBLIC_PAYMENT_LINK_URL || "#"}
                  className="inline-flex items-center justify-center rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600"
                >
                  Complete Payment to Unlock Featured Perks
                </Link>
              </div>
            )}
          </div>
        ) : null}

        {/* Events Management */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900">Events</h2>
            {!eventLimitReached ? (
              <button
                type="button"
                onClick={() => setShowCreateForm((current) => !current)}
                className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
              >
                {showCreateForm ? "Cancel" : "Create Event"}
              </button>
            ) : null}
          </div>

          {eventLimitReached ? (
            <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              {status === "rejected"
                ? "Event creation is unavailable while your listing is rejected."
                : "You've reached your active event limit for your current plan and status. Upgrade to a paid tier and complete payment to unlock unlimited events."}
            </p>
          ) : null}

          {showCreateForm && !eventLimitReached ? (
            <form className="mt-4 space-y-4 rounded-xl border border-slate-200 p-4" onSubmit={handleCreateEvent}>
              {createError ? (
                <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                  {createError}
                </div>
              ) : null}
              <div>
                <label htmlFor="eventTitle" className="mb-1 block text-sm font-semibold text-slate-700">Event Title</label>
                <input
                  id="eventTitle"
                  type="text"
                  value={eventTitle}
                  onChange={(fieldEvent) => setEventTitle(fieldEvent.target.value)}
                  disabled={creating}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                />
              </div>
              <div>
                <label htmlFor="eventDate" className="mb-1 block text-sm font-semibold text-slate-700">Event Date</label>
                <input
                  id="eventDate"
                  type="date"
                  value={eventDate}
                  onChange={(fieldEvent) => setEventDate(fieldEvent.target.value)}
                  disabled={creating}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                />
              </div>
              <div>
                <label htmlFor="eventDescription" className="mb-1 block text-sm font-semibold text-slate-700">Description</label>
                <textarea
                  id="eventDescription"
                  value={eventDescription}
                  onChange={(fieldEvent) => setEventDescription(fieldEvent.target.value)}
                  disabled={creating}
                  className="min-h-24 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                />
              </div>
              <button
                type="submit"
                disabled={creating}
                className="inline-flex items-center justify-center rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {creating ? "Creating..." : "Save Event"}
              </button>
            </form>
          ) : null}

          <ul className="mt-4 space-y-3">
            {events.length === 0 ? (
              <li className="text-sm text-slate-500">No events created yet.</li>
            ) : (
              events.map((event) => (
                <li key={event.id} className="rounded-xl border border-slate-200 p-4">
                  <p className="font-semibold text-slate-900">{event.title}</p>
                  {event.date ? <p className="text-xs text-slate-500">{event.date}</p> : null}
                  {event.description ? <p className="mt-1 text-sm text-slate-600">{event.description}</p> : null}
                </li>
              ))
            )}
          </ul>
        </div>
      </section>
    </main>
  );
}