"use client";

import { useEffect, useRef, useState } from "react";
import type { Profile } from "@/lib/types";
import { SOCIAL_PLATFORMS } from "@/lib/types";

export function ProfileSection() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/profile")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) {
          throw new Error(data.error || "Failed to load profile");
        }
        return data as Profile;
      })
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setMessage(err.message);
        setLoading(false);
      });
  }, []);

  async function handleSave() {
    if (!profile) return;
    setSaving(true);
    setMessage("");

    const res = await fetch("/api/admin/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });

    if (res.ok) {
      setMessage("Profile saved!");
    } else {
      const data = await res.json();
      setMessage(data.error || "Failed to save profile");
    }
    setSaving(false);
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      setProfile((p) => (p ? { ...p, photo_url: data.photo_url } : p));
      setMessage("Photo uploaded!");
    } else {
      const data = await res.json();
      setMessage(data.error || "Failed to upload photo");
    }
    setUploading(false);
  }

  if (loading) {
    return <p className="text-gray-500">Loading profile...</p>;
  }

  if (!profile) {
    return <p className="text-red-600">Failed to load profile</p>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-base font-semibold text-gray-900">Profile Photo</h2>

        <div className="mt-4 flex items-center gap-4">
          {profile.photo_url ? (
            <img
              src={profile.photo_url}
              alt="Profile"
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-200 text-2xl text-gray-400">
              ?
            </div>
          )}

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="admin-btn-secondary"
            >
              {uploading ? "Uploading..." : "Upload photo"}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Basic Info</h2>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            className="admin-input"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Bio
          </label>
          <input
            type="text"
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            className="admin-input"
            placeholder="Short bio line"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Theme
          </label>
          <div className="flex gap-2">
            {(["dark", "light"] as const).map((theme) => (
              <button
                key={theme}
                onClick={() => setProfile({ ...profile, theme })}
                className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
                  profile.theme === theme
                    ? "bg-indigo-600 text-white"
                    : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Social Links</h2>

        {SOCIAL_PLATFORMS.map(({ key, label }) => (
          <div key={key}>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {label}
            </label>
            <input
              type="url"
              value={profile[key]}
              onChange={(e) =>
                setProfile({ ...profile, [key]: e.target.value })
              }
              className="admin-input"
              placeholder={`https://${label.toLowerCase()}.com/...`}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="admin-btn-primary disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save profile"}
        </button>
        {message && (
          <span
            className={`text-sm ${
              message.includes("Failed") || message.includes("error")
                ? "text-red-600"
                : "text-gray-600"
            }`}
          >
            {message}
          </span>
        )}
      </div>
    </div>
  );
}
