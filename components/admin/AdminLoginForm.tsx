"use client";

import { useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function AdminLoginForm() {
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("error") === "invalid") {
      setError("Invalid password");
    }
  }, [searchParams]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        redirect: "manual",
      });

      if (res.status === 401) {
        setError("Invalid password");
        return;
      }

      if (res.status >= 300 && res.status < 400) {
        window.location.href = "/admin";
        return;
      }

      if (!res.ok) {
        setError("Something went wrong");
        return;
      }

      window.location.href = "/admin";
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="text-center text-xl font-semibold text-gray-900">
            Admin Login
          </h1>
          <p className="mt-1 text-center text-sm text-gray-500">
            Enter your password to continue
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="admin-input"
              autoFocus
              required
            />

            {error && (
              <p className="text-center text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="admin-btn-primary w-full disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
