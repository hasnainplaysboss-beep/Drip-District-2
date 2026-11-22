
export default function AdminLoginPage() {
  return (
    <main className="auth-container">
      <div className="auth-card">
        <a href="/" className="auth-logo">
          DRIP DISTRICT
        </a>

        <span className="admin-label">ADMIN ACCESS</span>

        <h1>Control centre.</h1>
        <p>Sign in with your authorised administrator account.</p>

        <form action="/api/admin/auth/login" method="POST">
          <label>Admin email</label>
          <input
            type="email"
            name="email"
            placeholder="admin@example.com"
            required
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Your admin password"
            required
          />

          <button type="submit">ADMIN SIGN IN</button>
        </form>

        <p className="auth-footer">
          Restricted access. Admin accounts are assigned privately.
        </p>
      </div>
    </main>
  );
}
