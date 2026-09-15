"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, serverTimestamp, writeBatch } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, db, storage } from "@/lib/firebase";

const categoryOptions = ["Activities & Classes", "Arts & Crafts", "Education", "Indoor Play", "Outdoor Recreation", "Sports & Fitness"];
const ageRanges = ["0-1.5", "1.5-3", "3-5", "5-12", "12-18"];

type GooglePlace = {
  formatted_address?: string;
  name?: string;
  place_id?: string;
  geometry?: { location?: { lat: () => number; lng: () => number } };
};

declare global {
  interface Window {
    google?: {
      maps?: {
        places?: {
          Autocomplete: new (
            input: HTMLInputElement,
            options: { fields: string[]; types: string[] }
          ) => { addListener: (event: "place_changed", handler: () => void) => void; getPlace: () => GooglePlace };
        };
      };
    };
  }
}

export default function BusinessProfileOnboardingPage() {
  const router = useRouter();
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [mainCategory, setMainCategory] = useState("");
  const [secondaryCategory, setSecondaryCategory] = useState("");
  const [location, setLocation] = useState("");
  const [placeDetails, setPlaceDetails] = useState<{ placeId: string; lat: number; lng: number } | null>(null);
  const [closedAllDay, setClosedAllDay] = useState(false);
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [features, setFeatures] = useState<Record<string, boolean>>({});
  const [selectedAges, setSelectedAges] = useState<string[]>([]);
  const [enrollInOffers, setEnrollInOffers] = useState(false);
  const [facebook, setFacebook] = useState("");
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const autocompleteInputRef = useRef<HTMLInputElement | null>(null);
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/business/login");
        return;
      }

      try {
        const userSnapshot = await getDoc(doc(db, "business_users", user.uid));
        const data = userSnapshot.data();
        if (typeof data?.businessId !== "string") {
          setError("We could not find your business registration. Please contact support.");
          return;
        }
        setBusinessId(data.businessId);
        setBusinessName(typeof data.business_name === "string" ? data.business_name : "");
        setEmail(typeof data.email === "string" ? data.email : user.email ?? "");
      } catch {
        setError("Unable to load your business profile. Please try again.");
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [router]);

  useEffect(() => {
    if (!googleMapsApiKey) {
      console.warn(
        "Google Places Autocomplete is disabled: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is missing. Add it to your .env.local file and restart the dev server."
      );
    }
  }, [googleMapsApiKey]);

  useEffect(() => {
    console.log("Google Script Loaded:", !!window.google?.maps?.places);

    const input = locationInputRef.current;
    const Autocomplete = window.google?.maps?.places?.Autocomplete;
    // The location input only mounts after `loading` flips to false, so wait until it exists in the DOM.
    // `googleMapsLoaded` re-triggers this effect once the next/script tag finishes loading.
    if (!input || !Autocomplete || autocompleteInputRef.current === input) {
      return;
    }

    const autocomplete = new Autocomplete(input, {
      fields: ["formatted_address", "name", "place_id", "geometry"],
      types: ["geocode"],
    });
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      const formattedAddress = place.formatted_address ?? place.name;
      if (!formattedAddress) {
        return;
      }
      setLocation(formattedAddress);
      setPlaceDetails(
        place.place_id && place.geometry?.location
          ? { placeId: place.place_id, lat: place.geometry.location.lat(), lng: place.geometry.location.lng() }
          : null
      );
    });
    autocompleteInputRef.current = input;
  }, [googleMapsLoaded, loading]);

  useEffect(() => () => {
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    photoPreviews.forEach((preview) => URL.revokeObjectURL(preview));
  }, [logoPreview, photoPreviews]);

  const toggleAge = (age: string) => {
    setSelectedAges((currentAges) =>
      currentAges.includes(age) ? currentAges.filter((currentAge) => currentAge !== age) : [...currentAges, age]
    );
  };

  const handlePhotosChange = (files: FileList | null) => {
    const selectedPhotos = Array.from(files ?? []).slice(0, 3);
    photoPreviews.forEach((preview) => URL.revokeObjectURL(preview));
    setPhotos(selectedPhotos);
    setPhotoPreviews(selectedPhotos.map((photo) => URL.createObjectURL(photo)));
  };

  const handleLogoChange = (file: File | null) => {
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogo(file);
    setLogoPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const user = auth.currentUser;

    if (!user || !businessId) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    if (
      !logo ||
      photos.length === 0 ||
      !businessName.trim() ||
      !mainCategory ||
      !secondaryCategory ||
      !location.trim() ||
      (!closedAllDay && (!openTime || !closeTime)) ||
      !email.trim() ||
      !phone.trim() ||
      !description.trim()
    ) {
      setError("Please complete all required listing details and upload a logo and at least one photo.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const logoReference = ref(storage, `businesses/${businessId}/logo.jpg`);
      await uploadBytes(logoReference, logo);
      const logoUrl = await getDownloadURL(logoReference);
      const photoUrls = await Promise.all(
        photos.map(async (photo, index) => {
          const photoReference = ref(storage, `businesses/${businessId}/photos/${index + 1}-${photo.name}`);
          await uploadBytes(photoReference, photo);
          return getDownloadURL(photoReference);
        })
      );

      const batch = writeBatch(db);
      batch.update(doc(db, "businesses", businessId), {
        businessId,
        businessName: businessName.trim(),
        logoUrl,
        photoUrls,
        mainCategory,
        secondaryCategory,
        location: location.trim(),
        placeId: placeDetails?.placeId ?? null,
        lat: placeDetails?.lat ?? null,
        lng: placeDetails?.lng ?? null,
        hoursOfOperation: { closedAllDay, openTime: closedAllDay ? "" : openTime, closeTime: closedAllDay ? "" : closeTime },
        email: email.trim(),
        phone: phone.trim(),
        description: description.trim(),
        features,
        ageRanges: selectedAges,
        enrollInOffers,
        socialLinks: { facebook: facebook.trim(), website: website.trim(), instagram: instagram.trim() },
        approvalStatus: "under_review",
        updatedAt: serverTimestamp(),
      });
      batch.update(doc(db, "business_users", user.uid), { onboardingStatus: "completed" });
      await batch.commit();
      router.push("/business/dashboard");
    } catch (err: unknown) {
      if (err instanceof FirebaseError && err.code === "storage/unauthorized") {
        setError("You do not have permission to upload listing images.");
      } else {
        setError("Unable to save your listing. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 via-white to-sky-50 text-slate-900">
      {googleMapsApiKey ? (
        <Script
          id="google-maps"
          src={`https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places&loading=async`}
          strategy="afterInteractive"
          onLoad={() => {
            console.log("Google Script Loaded:", !!window.google?.maps?.places);
            setGoogleMapsLoaded(true);
          }}
          onError={(scriptError) => console.error("Failed to load the Google Maps script:", scriptError)}
        />
      ) : null}
      <section className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-sky-100 sm:p-10">
          <div className="mx-auto flex w-fit rounded-2xl bg-white p-2">
            <Image src="/images/logo/logo.jpg" alt="Explore Kid Logo" width={140} height={60} className="h-12 w-auto object-contain" />
          </div>
          <h1 className="mt-6 text-center text-2xl font-bold text-slate-900 sm:text-3xl">Complete Your Business Listing</h1>
          <p className="mt-2 text-center text-sm leading-6 text-slate-600">Tell families what makes your business a great fit.</p>

          {error ? <div role="alert" className="mt-6 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div> : null}

          {loading ? <p className="mt-8 text-center text-sm text-slate-600">Loading your business profile...</p> : (
            <form className="mt-8 space-y-6" noValidate onSubmit={handleSubmit}>
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <span className="block text-sm font-semibold text-slate-700">Business Logo <span className="text-rose-600">*</span></span>
                  <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-sky-300 bg-sky-50 px-4 py-2.5 text-sm font-semibold text-sky-800 transition hover:bg-sky-100 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60">
                    <span aria-hidden="true">Upload</span> Upload Logo
                    <input type="file" accept="image/*" onChange={(event) => handleLogoChange(event.target.files?.[0] ?? null)} disabled={submitting} className="hidden" />
                  </label>
                  {logo && logoPreview ? <div className="mt-3 flex items-center gap-3"><Image src={logoPreview} alt="Selected business logo" width={48} height={48} unoptimized className="h-12 w-12 rounded-lg border border-slate-200 object-cover" /><span className="min-w-0 truncate text-xs text-slate-500">{logo.name}</span></div> : null}
                </div>
                <div>
                  <span className="block text-sm font-semibold text-slate-700">Photos (1 to 3) <span className="text-rose-600">*</span></span>
                  <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-sky-300 bg-sky-50 px-4 py-2.5 text-sm font-semibold text-sky-800 transition hover:bg-sky-100 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60">
                    <span aria-hidden="true">Upload</span> Upload Photos (1-3)
                    <input type="file" accept="image/*" multiple onChange={(event) => handlePhotosChange(event.target.files)} disabled={submitting} className="hidden" />
                  </label>
                  {photos.length ? <div className="mt-3 flex flex-wrap gap-3">{photos.map((photo, index) => <div key={`${photo.name}-${index}`} className="w-20"><Image src={photoPreviews[index]} alt={`Selected business photo ${index + 1}`} width={80} height={80} unoptimized className="h-20 w-20 rounded-lg border border-slate-200 object-cover" /><span className="mt-1 block truncate text-xs text-slate-500">{photo.name}</span></div>)}</div> : null}
                </div>
                <Field label="Business Name" value={businessName} onChange={setBusinessName} disabled={submitting} required />
                <Field label="Business Email" type="email" value={email} onChange={setEmail} disabled={submitting} required />
                <SelectField label="Main Business Category" value={mainCategory} onChange={setMainCategory} disabled={submitting} />
                <SelectField label="Secondary Business Category" value={secondaryCategory} onChange={setSecondaryCategory} disabled={submitting} />
                <label className="block text-sm font-semibold text-slate-700">Business Location <span className="text-rose-600">*</span><input ref={locationInputRef} type="text" value={location} onChange={(event) => { setLocation(event.target.value); setPlaceDetails(null); }} disabled={submitting} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-normal outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200" placeholder="Start typing an address, city, or county" /></label>
                <Field label="Business Phone" type="tel" value={phone} onChange={setPhone} disabled={submitting} required />
              </div>

              <div className="rounded-xl border border-slate-200 p-5">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700"><input type="checkbox" checked={closedAllDay} onChange={(event) => setClosedAllDay(event.target.checked)} disabled={submitting} /> Closed all day</label>
                {!closedAllDay ? <div className="mt-4 grid gap-5 sm:grid-cols-2"><Field label="Open Time" type="time" value={openTime} onChange={setOpenTime} disabled={submitting} required /><Field label="Close Time" type="time" value={closeTime} onChange={setCloseTime} disabled={submitting} required /></div> : null}
              </div>

              <label className="block text-sm font-semibold text-slate-700">Business Description <span className="text-rose-600">*</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} disabled={submitting} className="mt-2 min-h-32 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-normal outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200" /></label>

              <CheckboxGroup title="Features & Amenities" options={{ indoorPlay: "Indoor Play", outdoorPlay: "Outdoor Play", sensoryFriendly: "Sensory Friendly", wheelchairAccessible: "Wheelchair Accessible" }} values={features} onChange={setFeatures} disabled={submitting} />
              <div><p className="text-sm font-semibold text-slate-700">Age Ranges</p><div className="mt-3 flex flex-wrap gap-4">{ageRanges.map((age) => <label key={age} className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={selectedAges.includes(age)} onChange={() => toggleAge(age)} disabled={submitting} /> {age}</label>)}</div></div>
              <label className="flex items-start gap-2 text-sm text-slate-700"><input type="checkbox" checked={enrollInOffers} onChange={(event) => setEnrollInOffers(event.target.checked)} disabled={submitting} className="mt-1" /> Enroll in Offers Program — allow my business to send offers to users through the app.</label>

              <div className="grid gap-5 md:grid-cols-3"><Field label="Facebook" type="url" value={facebook} onChange={setFacebook} disabled={submitting} /><Field label="Website" type="url" value={website} onChange={setWebsite} disabled={submitting} /><Field label="Instagram" type="url" value={instagram} onChange={setInstagram} disabled={submitting} /></div>
              <button type="submit" disabled={submitting || !businessId} className="inline-flex w-full items-center justify-center rounded-xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-70">{submitting ? "Saving listing..." : "Submit Listing for Review"}</button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

function Field({ label, type = "text", value, onChange, disabled, required = false }: { label: string; type?: string; value: string; onChange: (value: string) => void; disabled: boolean; required?: boolean }) {
  return <label className="block text-sm font-semibold text-slate-700">{label} {required ? <span className="text-rose-600">*</span> : null}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-normal outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200" /></label>;
}

function SelectField({ label, value, onChange, disabled }: { label: string; value: string; onChange: (value: string) => void; disabled: boolean }) {
  return <label className="block text-sm font-semibold text-slate-700">{label} <span className="text-rose-600">*</span><select value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-normal outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"><option value="">Select a category</option>{categoryOptions.map((category) => <option key={category} value={category}>{category}</option>)}</select></label>;
}

function CheckboxGroup({ title, options, values, onChange, disabled }: { title: string; options: Record<string, string>; values: Record<string, boolean>; onChange: (values: Record<string, boolean>) => void; disabled: boolean }) {
  return <div><p className="text-sm font-semibold text-slate-700">{title}</p><div className="mt-3 flex flex-wrap gap-4">{Object.entries(options).map(([key, label]) => <label key={key} className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={values[key] ?? false} onChange={(event) => onChange({ ...values, [key]: event.target.checked })} disabled={disabled} /> {label}</label>)}</div></div>;
}
