
import Link from 'next/link';

export default function Page() {
  return (
    <>
      <header className="header">
        <Link className="logo" href="/">♛ DRIP DISTRICT</Link>
        <nav className="nav">
          <Link href="/shop">SHOP</Link>
          <Link href="/account">ACCOUNT</Link>
        </nav>
      </header>

      <main className="wrap section">
        <h1>ABOUT DRIP DISTRICT</h1>
        <p
          style={{
            whiteSpace: 'pre-line',
            maxWidth: 850,
            lineHeight: 1.8,
            color: '#bbb',
          }}
        >
          Drip District brings together sought-after clothing,
          technology and accessories from brands people know
          and trust. Our focus is a considered selection,
          straightforward shopping and dependable service.
          Discover your next favourite and explore the District.
        </p>
      </main>

      <footer className="footer">
        <div className="footerLinks">
          <Link href="/delivery">DELIVERY</Link>
          <Link href="/returns">RETURNS</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/contact">CONTACT</Link>
        </div>
      </footer>
    </>
  );
}
