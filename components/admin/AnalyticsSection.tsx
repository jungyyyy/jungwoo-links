"use client";

import { useEffect, useState } from "react";
import type { AnalyticsRow } from "@/lib/types";

type AnalyticsData = {
  rows: AnalyticsRow[];
  mostClickedThisWeek: AnalyticsRow | null;
};

export function AnalyticsSection() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className="text-gray-500">Loading analytics...</p>;
  }

  if (!data) {
    return <p className="text-red-600">Failed to load analytics</p>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-base font-semibold text-gray-900">Analytics</h2>

      {data.mostClickedThisWeek && (
        <div className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-6">
          <p className="text-sm font-medium text-indigo-600">
            Most clicked this week
          </p>
          <p className="mt-1 text-xl font-bold text-gray-900">
            {data.mostClickedThisWeek.title}
          </p>
          <p className="mt-1 text-sm text-gray-600">
            {data.mostClickedThisWeek.clicks_last_7_days} clicks in the last 7
            days
          </p>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 font-medium text-gray-700">Link</th>
              <th className="px-4 py-3 font-medium text-gray-700 text-right">
                Total clicks
              </th>
              <th className="px-4 py-3 font-medium text-gray-700 text-right">
                Last 7 days
              </th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row) => (
              <tr key={row.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3 text-gray-900">{row.title}</td>
                <td className="px-4 py-3 text-right text-gray-600">
                  {row.total_clicks}
                </td>
                <td className="px-4 py-3 text-right text-gray-600">
                  {row.clicks_last_7_days}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {data.rows.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-500">
            No click data yet.
          </p>
        )}
      </div>
    </div>
  );
}
