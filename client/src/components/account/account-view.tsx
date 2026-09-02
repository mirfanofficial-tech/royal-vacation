"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Loader2 } from "lucide-react";

import type { UserOut } from "@royal-vacation/api-client";
import { ApiError, api } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { countryOptions } from "@/lib/checkout-mock-data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const labelClass = "mb-1.5 block text-sm font-medium text-foreground";
const selectClass =
  "h-10 w-full rounded-lg border border-input bg-white px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function AccountView() {
  const router = useRouter();
  const [user, setUser] = useState<UserOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");

  useEffect(() => {
    if (!getSession()) {
      router.replace("/login");
      return;
    }
    api.profile
      .get()
      .then((u) => {
        setUser(u);
        setFirstName(u.first_name ?? "");
        setLastName(u.last_name ?? "");
        setPhone(u.phone ?? "");
        setCity(u.city ?? "");
        setCountry(u.country ?? "");
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) router.replace("/login");
        else setError("Couldn't load your account.");
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const updated = await api.profile.update({
        first_name: firstName.trim() || undefined,
        last_name: lastName.trim() || undefined,
        display_name: [firstName, lastName].filter(Boolean).join(" ").trim() || undefined,
        phone: phone.trim() || undefined,
        city: city.trim() || undefined,
        country: country || undefined,
      });
      setUser(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save your changes.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSave}
      className="mt-6 rounded-2xl border border-border bg-white p-6 shadow-sm"
    >
      <p className="text-sm text-muted-foreground">
        Signed in as <span className="font-medium text-foreground">{user?.email}</span>
      </p>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="firstName">First name</label>
          <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </div>
        <div>
          <label className={labelClass} htmlFor="lastName">Last name</label>
          <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
        <div>
          <label className={labelClass} htmlFor="phone">Phone</label>
          <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <label className={labelClass} htmlFor="city">City</label>
          <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
        <div>
          <label className={labelClass} htmlFor="country">Country / Region</label>
          <select
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className={selectClass}
          >
            <option value="">Select…</option>
            {countryOptions.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <div className="mt-6 flex items-center gap-3">
        <Button
          type="submit"
          disabled={saving}
          className="gap-2 rounded-lg bg-navy text-white hover:bg-navy-light disabled:opacity-60"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Save changes
        </Button>
        {saved && (
          <span className="flex items-center gap-1 text-sm text-rating">
            <BadgeCheck className="h-4 w-4" />
            Saved
          </span>
        )}
      </div>
    </form>
  );
}
