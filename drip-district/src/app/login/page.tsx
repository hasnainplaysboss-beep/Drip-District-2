
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  let errorMessage = "";

  if (error === "missing") {
    errorMessage = "Please enter your email and password.";
  } else if (error === "invalid") {
    errorMessage = "Incorrect email or password. Please try again.";
  } else if (error === "server") {
    errorMessage = "Something went wrong on our server. Please try again.";
  }

  return (
    <main className="auth-container">
      <div className="auth-card">
        <a href="/" className="auth-logo">
          DRIP DISTRICT
        </a>

        <h1>Welcome back.</h1>
        <p>Sign in to your District account.</p>

        {errorMessage && (
          <p style={{ color: "#dc2626", marginBottom: "16px" }}>
            {errorMessage}
          </p>
        )}

        <form action="/api/auth/login" method="POST">
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
