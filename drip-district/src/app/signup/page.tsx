
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
          <label htmlFor="name">Full name</label>
          <input
            id="name"
            type="text"
            name="name"
            placeholder="Your full name"
            required
          />

          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="you@example.com"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            placeholder="Create a password"
            minLength={8}
            required
          />

          <label htmlFor="confirmPassword">Confirm password</label>
          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            placeholder="Confirm your password"
            minLength={8}
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
