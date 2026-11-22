
export default function LoginPage() {
  return (
    <main className="auth-container">
      <div className="auth-card">
        <a href="/" className="auth-logo">
          DRIP DISTRICT
        </a>

        <h1>Welcome back.</h1>
        <p>Sign in to your District account.</p>

        <form action="/api/auth/login" method="POST">
          <label>Email address</label>
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            required
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            required
          />

          <button type="submit">SIGN IN</button>
        </form>

        <p className="auth-footer">
          Don't have an account? <a href="/signup">Create one</a>
        </p>
      </div>
    </main>
  );
}
