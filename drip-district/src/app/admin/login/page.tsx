
"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid email or password.");
        setLoading(false);
        return;
      }

      window.location.href = "/admin";
    } catch {
      setError("Unable to connect. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="auth-container">
      <div className="auth-card">
        <a href="/" className="auth-logo">
          DRIP DISTRICT
        </a>

        <span className="admin-label">ADMIN ACCESS</span>

        <h1>Control centre.</h1>
        <p>Sign in with your authorised administrator account.</p>

        {error && (
          <p style={{ color: "#dc2626", marginBottom: "16px" }}>
            {error}
          </p>
        )}

        <form onSubmit={handleLogin}>
          <label htmlFor="email">Admin email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@example.com"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Your admin password"
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "SIGNING IN..." : "ADMIN SIGN IN"}
          </button>
        </form>

        <p className="auth-footer">
          Restricted access. Admin accounts are assigned privately.
        </p>
      </div>
    </main>
  );
}
