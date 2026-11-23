
"use client";

import { useEffect, useState } from "react";

type Review = {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  verified: boolean;
  createdAt: string;
  product: {
    title: string;
    slug: string;
  };
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState("");

  async function loadReviews() {
    try {
      const res = await fetch("/api/admin/reviews");
      if (!res.ok) {
        setMessage("Unable to load reviews. Are you logged in as admin?");
        return;
      }
      const data = await res.json();
      setReviews(data);
    } catch {
      setMessage("Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReviews();
  }, []);

  async function moderate(reviewId: string, action: "approve" | "reject") {
    setBusyId(reviewId);
    setMessage("");

    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reviewId, action }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Action failed.");
        return;
      }

      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      setMessage(
        action === "approve"
          ? "Review approved."
          : "Review rejected and deleted."
      );
    } catch {
      setMessage("Something went wrong.");
    } finally {
      setBusyId("");
    }
  }

  if (loading) return <main className="container">Loading reviews...</main>;

  return (
    <main className="container" style={{ paddingTop: 30, paddingBottom: 50 }}>
      <h1>Review Moderation</h1>
      <p>Review submissions before they appear publicly.</p>

      {message && <p>{message}</p>}

      {reviews.length === 0 ? (
        <p>No pending reviews.</p>
      ) : (
        <div style={{ display: "grid", gap: 20, marginTop: 24 }}>
          {reviews.map((review) => (
            <article
              key={review.id}
              className="simple-card"
              style={{ padding: 20 }}
            >
              <h3>{review.product.title}</h3>

              <p>
                <a href={`/product/${review.product.slug}`}>
                  View product
                </a>
              </p>

              <p style={{ color: "#e6a700", fontSize: 22 }}>
                {"★".repeat(review.rating)}
                {"☆".repeat(5 - review.rating)}
              </p>

              {review.title && <h4>{review.title}</h4>}

              <p style={{ whiteSpace: "pre-wrap" }}>{review.body}</p>

              <p style={{ fontSize: 13, opacity: 0.7 }}>
                Anonymous Customer ·{" "}
                {review.verified ? "Verified Purchase" : "Unverified"}
              </p>

              <p style={{ fontSize: 13, opacity: 0.7 }}>
                Submitted:{" "}
                {new Date(review.createdAt).toLocaleDateString("en-GB")}
              </p>

              <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                <button
                  onClick={() => moderate(review.id, "approve")}
                  disabled={busyId === review.id}
                >
                  Approve
                </button>

                <button
                  onClick={() => moderate(review.id, "reject")}
                  disabled={busyId === review.id}
                >
                  Reject
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
