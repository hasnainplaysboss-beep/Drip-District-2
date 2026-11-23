
"use client";

import { useState } from "react";

export default function ProductReviews({
  productId,
}: {
  productId: string;
}) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submitReview() {
    setMessage("");

    if (body.trim().length < 10) {
      setMessage("Your review must be at least 10 characters long.");
      return;
    }

    setBusy(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          rating,
          title,
          body,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Unable to submit review.");
        return;
      }

      setMessage(
        "Review submitted! It will appear once approved."
      );
      setRating(5);
      setTitle("");
      setBody("");
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="simple-card" style={{ marginTop: 24 }}>
      <h2>Write a Review</h2>

      <p style={{ opacity: 0.7, fontSize: 14 }}>
        Reviews are anonymous and only available to customers
        who have purchased and received this product.
        All reviews are checked before publication.
      </p>

      <div style={{ marginTop: 16 }}>
        <label>Rating</label>

        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              style={{
                fontSize: 28,
                background: "none",
                border: "none",
                cursor: "pointer",
                color: star <= rating ? "#f5b301" : "#888",
              }}
              aria-label={`${star} stars`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <label>Review title (optional)</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarise your experience"
          maxLength={100}
          style={{ width: "100%", marginTop: 8 }}
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <label>Your review</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Tell us about the product..."
          rows={5}
          maxLength={2000}
          style={{ width: "100%", marginTop: 8 }}
        />
      </div>

      <button
        type="button"
        onClick={submitReview}
        disabled={busy}
        style={{ marginTop: 16 }}
      >
        {busy ? "Submitting..." : "Submit Anonymous Review"}
      </button>

      {message && (
        <p style={{ marginTop: 12 }}>
          {message}
        </p>
      )}
    </section>
  );
}
