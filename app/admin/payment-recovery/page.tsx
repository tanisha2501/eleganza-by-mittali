"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type RecoveryRecord = {
  id: number;
  razorpay_payment_id: string;
  razorpay_order_id: string;
  customer_email: string;
  customer_name: string;
  expected_amount_paise: number;
  status: "pending" | "completed" | "needs_review";
  order_number: string | null;
  last_error: string | null;
  attempts: number;
  created_at: string;
  updated_at: string;
};

export default function PaymentRecoveryPage() {
  const [records, setRecords] = useState<RecoveryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadRecords() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          window.location.href = "/admin/login";
          return;
        }

        if (
          user.email?.toLowerCase() !==
          "mittaligoyal2602@gmail.com"
        ) {
          await supabase.auth.signOut();
          window.location.href = "/admin/login";
          return;
        }

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session?.access_token) {
          throw new Error("Please log in again.");
        }

        const response = await fetch(
          "/api/admin/payment-recovery",
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || "Could not load recovery records."
          );
        }

        if (active) {
          setRecords(result.records ?? []);
        }
      } catch (error) {
        if (active) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Something went wrong."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadRecords();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="text-2xl font-semibold">
        Payment Recovery
      </h1>

      <p className="mt-2 text-sm text-gray-600">
        Review payment records that may need attention.
      </p>

      {loading && (
        <p className="mt-6">Loading recovery records...</p>
      )}

      {errorMessage && (
        <p className="mt-6 text-red-600">
          {errorMessage}
        </p>
      )}

      {!loading && !errorMessage && records.length === 0 && (
        <p className="mt-6 rounded-lg border p-4">
          No payment recovery records found.
        </p>
      )}

      {!loading && records.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="p-3">Payment ID</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3">Order Number</th>
                <th className="p-3">Attempts</th>
                <th className="p-3">Last Error</th>
              </tr>
            </thead>

            <tbody>
              {records.map((record) => (
                <tr key={record.id} className="border-b">
                  <td className="p-3">
                    {record.razorpay_payment_id}
                  </td>
                  <td className="p-3">
                    <div>{record.customer_name}</div>
                    <div className="text-gray-500">
                      {record.customer_email}
                    </div>
                  </td>
                  <td className="p-3">
                    ₹
                    {(
                      Number(record.expected_amount_paise) / 100
                    ).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="p-3">
                    {record.status}
                  </td>
                  <td className="p-3">
                    {record.order_number || "—"}
                  </td>
                  <td className="p-3">
                    {record.attempts}
                  </td>
                  <td className="p-3">
                    {record.last_error || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}