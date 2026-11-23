

import "./auth-pages.css";
import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/cart/CartProvider";
import { Header, Footer } from "@/components/StoreShell";
import Chatbot from "@/components/Chatbot";

export const metadata: Metadata = {
  title: "Drip District | Designer Clothing, Tech & Accessories",
  description:
    "Shop Drip District for designer clothing, electronics and accessories. Discover premium brands, sought-after styles and the latest essentials all in one destination.",
  verification: {
    google: "xPmMuxMa-tBKyBxvrjgswduQfOs5oZr7qoDjNrCR00o",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-GB">
      <body>
        <CartProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <Chatbot />
        </CartProvider>
      </body>
    </html>
  );
}
