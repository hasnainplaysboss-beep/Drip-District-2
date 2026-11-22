
export default function SignupPage() {
  return (
    <main className="auth-container">
      <div className="auth-card">
        <a href="/" className="auth-logo">
          DRIP DISTRICT
        </a>

        <h1>Join the District.</h1>
        <p>Create your account to get started.</p>

        <form action="/api/auth/signup" method="POST">
          <label>Full name</label>
          <input
            type="text"
            name="name"
            placeholder="Your full name"
            required
          />

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
            placeholder="Create a password"
            minLength={8}
            required
          />

          <label>Confirm password</label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm your password"
            required
          />

          <button type="submit">CREATE ACCOUNT</button>
        </form>

        <p className="auth-footer">
          Already have an account? <a href="/login">Sign in</a>
        </p>
      </div>
    </main>
  );
}
