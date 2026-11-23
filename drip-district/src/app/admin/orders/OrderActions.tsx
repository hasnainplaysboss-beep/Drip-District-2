
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  orderId: string;
  status: string;
  trackingCarrier: string | null;
  trackingNumber: string | null;
};

const statuses = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

export default function OrderActions({
  orderId,
  status,
  trackingCarrier,
  trackingNumber,
}: Props) {
  const router = useRouter();

  const [newStatus, setNewStatus] = useState(status);
  const [carrier, setCarrier] = useState(trackingCarrier || "");
  const [tracking, setTracking] = useState(trackingNumber || "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function saveChanges() {
    setBusy(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          status: newStatus,
          trackingCarrier: carrier,
          trackingNumber: tracking,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || "Could not update order.");
        return;
      }

      setMessage("Order updated successfully.");
      router.refresh();
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        display: "grid",
        gap: "12px",
        marginTop: "20px",
        paddingTop: "16px",
        borderTop: "1px solid var(--border, #ddd)",
      }}
    >
      <h3>Manage order</h3>

      <label>
        Order status
        <select
          value={newStatus}
          onChange={(event) => setNewStatus(event.target.value)}
          disabled={busy}
          style={{ display: "block", width: "100%", padding: "10px", marginTop: "6px" }}
        >
          {statuses.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      <label>
        Delivery carrier
        <input
          value={carrier}
          onChange={(event) => setCarrier(event.target.value)}
          placeholder="e.g. Royal Mail, DPD, Evri"
          disabled={busy}
          style={{ display: "block", width: "100%", padding: "10px", marginTop: "6px" }}
        />
      </label>

      <label>
        Tracking number
        <input
          value={tracking}
          onChange={(event) => setTracking(event.target.value)}
          placeholder="Enter tracking number"
          disabled={busy}
          style={{ display: "block", width: "100%", padding: "10px", marginTop: "6px" }}
        />
      </label>

      <button type="button" onClick={saveChanges} disabled={busy}>
        {busy ? "Saving..." : "Save order changes"}
      </button>

      {message && <p role="status">{message}</p>}
    </div>
  );
}
