"use client";

export default function ShippingPage() {
  return (
    <main className="policy-page">

      {/* NAVBAR */}
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

      {/* HEADER */}
      <section className="policy-header">
        <p className="small-heading">
          ELEGANZA BY MITTALI
        </p>

        <h1>Shipping & Delivery</h1>

        <p>
          Everything you need to know about order
          processing and delivery.
        </p>
      </section>

      {/* CONTENT */}
      <section className="policy-content">

        <div className="policy-intro">
          <h2>Order Processing</h2>

          <p>
            All orders are processed and dispatched
            within <strong>2–3 working days</strong>
            after the order is confirmed.
          </p>
        </div>

        <div className="policy-block">
          <h2>India Delivery</h2>

          <p>
            Orders within India are generally delivered
            within <strong>7–8 working days</strong>
            after dispatch.
          </p>

          <p>
            Delivery timelines may vary depending on the
            delivery location and courier service.
          </p>
        </div>

        <div className="policy-block">
          <h2>International Delivery</h2>

          <p>
            International orders generally take
            <strong> 15–20 days</strong> for delivery.
          </p>

          <p>
            International delivery timelines may vary
            depending on the destination country,
            customs procedures and courier service.
          </p>
        </div>

        <div className="policy-block">
          <h2>Tracking Your Order</h2>

          <p>
            Once your order has been dispatched, the
            relevant shipping or tracking information
            will be provided to you.
          </p>
        </div>

        <div className="policy-block">
          <h2>Delivery Delays</h2>

          <p>
            While we aim to deliver your order within
            the mentioned timelines, unforeseen courier,
            weather, customs or other logistical issues
            may occasionally cause delays.
          </p>
        </div>

        <div className="policy-note">
          <strong>Please Note:</strong>

          <p>
            The delivery timeline starts after the order
            has been dispatched. Processing and dispatch
            generally take 2–3 working days.
          </p>
        </div>

      </section>

      {/* FOOTER */}
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
            © 2026 Eleganza by Mittali.
            All Rights Reserved.
          </p>

          <p>
            Made with elegance ♡
          </p>

        </div>

      </footer>

    </main>
  );
}