
"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, UserRound, ShoppingBag, Menu, X } from "lucide-react";
import { useCart } from "./cart/CartProvider";

export function Header() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();

  return (
    <>
      <div className="announcement">
        FREE UK DELIVERY ON ORDERS OVER £75 <span> | </span>
        <Link href="/shop">SHOP NOW ↗</Link>
      </div>

      <header className="site-header">
        <Link
          className="brand-logo"
          href="/"
          aria-label="Drip District home"
        >
          <span className="crown">♛</span>
          <span>
            DRIP
            <br />
            DISTRICT
          </span>
        </Link>

        <nav className="desktop-nav">
          <Link href="/">HOME</Link>
          <Link href="/shop">SHOP</Link>
          <Link href="/clothing">CLOTHING⌄</Link>
          <Link href="/electronics">TECH⌄</Link>
          <Link href="/accessories">ACCESSORIES⌄</Link>
          <Link href="/about">ABOUT</Link>
          <Link href="/contact">CONTACT</Link>
        </nav>

        <div className="header-actions">
          <Link href="/shop" aria-label="Search">
            <Search />
          </Link>

          <Link href="/account" aria-label="My Account">
            <UserRound />
          </Link>

          <Link href="/cart" aria-label="Basket" className="bag">
            <ShoppingBag />
            <small>{count}</small>
          </Link>

          <button
            className="mobile-menu"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {open && (
        <nav className="mobile-nav">
          {[
            "/",
            "/shop",
            "/clothing",
            "/clothing/mens",
            "/clothing/womens",
            "/electronics",
            "/accessories",
            "/accessories/mens",
            "/accessories/womens",
            "/about",
            "/contact",
            "/account",
          ].map((href) => (
            <Link
              onClick={() => setOpen(false)}
              key={href}
              href={href}
            >
              {href === "/"
                ? "HOME"
                : href.slice(1).replaceAll("/", " ").toUpperCase()}
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}

export function Footer() {
  const [a, setA] = useState(false);
  const [b, setB] = useState(false);

  return (
    <footer className="footer">
      <div className="footer-brand">
        DRIP DISTRICT
        <p>THE DISTRICT OF WHAT'S NEXT.</p>
      </div>

      <div className="footer-accordions">
        <section>
          <button onClick={() => setA(!a)}>
            CUSTOMER SERVICE <b>{a ? "−" : "+"}</b>
          </button>

          {a && (
            <div className="footer-links">
              <Link href="/contact">Contact us</Link>
              <Link href="/faq">FAQs</Link>
              <Link href="/delivery">Delivery</Link>
              <Link href="/returns">Returns</Link>
            </div>
          )}
        </section>

        <section>
          <button onClick={() => setB(!b)}>
            EXPLORE DRIP DISTRICT <b>{b ? "−" : "+"}</b>
          </button>

          {b && (
            <div className="footer-links">
              <Link href="/shop">Shop all</Link>
              <Link href="/clothing">Clothing</Link>
              <Link href="/electronics">Electronics</Link>
              <Link href="/accessories">Accessories</Link>
              <Link href="/account">My account</Link>
              <Link href="/wishlist">Wishlist</Link>
            </div>
          )}
        </section>
      </div>

      <div className="payment-badges">
        <span>VISA</span>
        <span>mastercard</span>
        <span>AMEX</span>
        <span>PayPal</span>
        <span>Apple Pay</span>
        <span>Klarna*</span>
      </div>

      <div className="country">
        <label htmlFor="country">COUNTRY / REGION</label>
        <select id="country" defaultValue="uk">
          <option value="uk">United Kingdom (GBP £)</option>
        </select>
      </div>

      <div className="legal">
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/cookies">Cookies</Link>
        <span>© {new Date().getFullYear()} DRIP DISTRICT</span>
      </div>
    </footer>
  );
}
