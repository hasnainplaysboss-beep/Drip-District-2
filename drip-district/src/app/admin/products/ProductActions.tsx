
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProductActions({
  productId,
}: {
  productId: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function deleteProduct() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product? This cannot be undone."
    );

    if (!confirmed) return;

    setDeleting(true);
    setError("");

    try {
      const response = await fetch("/api/admin/products", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: productId }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Could not delete product.");
        return;
      }

      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
      <Link
        href={`/admin/products/${productId}/edit`}
        style={{
          display: "inline-block",
          padding: "9px 14px",
          background: "#222",
          color: "#fff",
          textDecoration: "none",
          fontWeight: "bold",
        }}
      >
        EDIT
      </Link>

      <button
        type="button"
        onClick={deleteProduct}
        disabled={deleting}
        style={{
          padding: "9px 14px",
          background: "#b42318",
          color: "#fff",
          border: 0,
          fontWeight: "bold",
          opacity: deleting ? 0.6 : 1,
        }}
      >
        {deleting ? "DELETING..." : "DELETE"}
      </button>

      {error && (
        <p role="alert" style={{ color: "#b42318", width: "100%" }}>
          {error}
        </p>
      )}
    </div>
  );
}
