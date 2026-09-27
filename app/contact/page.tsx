"use client";

export default function ContactPage() {
  return (
    <main className="contact-page">
      <header className="navbar">
        <div className="nav-container">
          <a href="/" className="brand">
            <img
              src="/logo.png"
              alt="Eleganza by Mittali"
              className="logo"
            />
          </a>

          <nav className="nav-links">
            <a href="/">Home</a>
            <a href="/shop">Shop</a>
            <a href="/#categories">Collections</a>
            <a href="/#about">About Us</a>
            <a href="/contact">Contact</a>
          </nav>
        </div>
      </header>

      <section className="contact-header">
        <p className="small-heading">
          ELEGANZA BY MITTALI
        </p>

        <h1>Contact Us</h1>

        <p>
          We’re here to help you with your orders,
          products and queries.
        </p>
      </section>

      <section className="contact-section">
        <div className="contact-grid">

          <div className="contact-card">
            <span>💬</span>

            <h2>WhatsApp</h2>

            <p>
              Have a question? Chat with us directly
              on WhatsApp.
            </p>

            <a
              href="https://wa.me/917888535887"
              target="_blank"
              rel="noopener noreferrer"
              className="primary-btn"
            >
              CHAT ON WHATSAPP
            </a>
          </div>

          <div className="contact-card">
            <span>📸</span>

            <h2>Instagram</h2>

            <p>
              Follow Eleganza by Mittali for new
              collections and updates.
            </p>

            <a
              href="https://www.instagram.com/eleganza_by_mittali"
              target="_blank"
              rel="noopener noreferrer"
              className="primary-btn"
            >
              FOLLOW US
            </a>
          </div>

        </div>
      </section>

      <footer>
        <div className="footer-main">

          <div>
            <img
              src="/logo.png"
              alt="Eleganza by Mittali"
              className="footer-logo"
            />

            <p>
              Elegant fashion inspired by tradition,
              designed for today.
            </p>
          </div>

          <div>
            <h4>QUICK LINKS</h4>
            <a href="/">Home</a>
            <a href="/shop">Shop</a>
            <a href="/#about">About Us</a>
            <a href="/contact">Contact</a>
          </div>
       <div>
        <h4>POLICIES</h4>
        <a href="/exchange-return">Exchange & Return</a>
        <a href="/shipping">Shipping & Delivery</a>
        <a href="/privacy-policy">Privacy Policy</a>
        <a href="/terms-conditions">Terms & Conditions</a>
        <a href="/cancellation-refund">
  Cancellation & Refund
</a>
      </div>

          <div>
            <h4>CONTACT</h4>

            <a
              href="https://wa.me/917888535887"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp Us
            </a>

            <a
              href="https://www.instagram.com/eleganza_by_mittali"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </a>

          </div>

        </div>

        <div className="footer-bottom">
          <p>
            © 2026 Eleganza by Mittali. All Rights Reserved.
          </p>

          <p>Made with elegance ♡</p>
        </div>
      </footer>
    </main>
  );
}