
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  customerId: string;
  banned: boolean;
  role: string;
};

export default function CustomerActions({
  customerId,
  banned,
  role,
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function updateCustomer(action: string) {
    const prompts: Record<string, string> = {
      ban: "Are you sure you want to ban this customer?",
      unban: "Unban this customer?",
      "make-admin": "Give this customer administrator access?",
      "remove-admin": "Remove this customer's administrator access?",
    };

    if (!window.confirm(prompts[action])) return;

    setBusy(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/customers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId, action }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || "Something went wrong.");
        return;
      }

      setMessage("Updated successfully.");
      router.refresh();
    } catch {
      setMessage("Could not update this customer.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {banned ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => updateCustomer("unban")}
        >
          Unban
        </button>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => updateCustomer("ban")}
        >
          Ban customer
        </button>
      )}

      {role === "ADMIN" ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => updateCustomer("remove-admin")}
        >
          Remove admin
        </button>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => updateCustomer("make-admin")}
        >
          Make admin
        </button>
      )}

      {message && (
        <small role="status">
          {message}
        </small>
      )}
    </div>
  );
}
