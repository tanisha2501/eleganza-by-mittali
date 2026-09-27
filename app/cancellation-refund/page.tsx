"use client";

export default function CancellationRefundPage() {
  return (
    <main className="policy-page">
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

      <section className="policy-header">
        <p className="small-heading">ELEGANZA BY MITTALI</p>
        <h1>Cancellation & Refund Policy</h1>
        <p>
          Information about order cancellation and refunds.
        </p>
      </section>

      <section className="policy-content">
        <div className="policy-intro">
          <h2>Order Cancellation</h2>
          <p>
            Customers may request cancellation of an order before the order
            has been shipped.
          </p>
          <p>
            Once an order has been shipped, cancellation is not permitted.
          </p>
        </div>

        <div className="policy-block">
          <h2>Online Payment Orders</h2>
          <p>
            If an online prepaid order is cancelled before shipping, the
            customer will receive a <strong>full refund</strong> of the
            amount paid.
          </p>
        </div>

        <div className="policy-block">
          <h2>Cash on Delivery Orders</h2>
          <p>
            For Cash on Delivery orders, cancellation before shipping will
            simply cancel the order. No payment refund is applicable because
            payment has not been made at the time of cancellation.
          </p>
        </div>

        <div className="policy-block">
          <h2>After Shipping</h2>
          <p>
            Once an order has been shipped, it cannot be cancelled.
          </p>
          <p>
            Customers should refer to our Exchange & Return Policy for
            eligible exchange-related requests.
          </p>
        </div>

        <div className="policy-block">
          <h2>Refund Processing</h2>
          <p>
            For eligible prepaid order cancellations, the refund will be
            initiated after the cancellation is confirmed.
          </p>
          <p>
            The time taken for the refunded amount to reflect may depend on
            the payment method and the relevant payment service provider.
          </p>
        </div>

        <div className="policy-note">
          <strong>Important:</strong>
          <p>
            Cancellation requests must be made before the order is shipped.
            Orders that have already been shipped cannot be cancelled.
          </p>
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
              Elegant fashion inspired by tradition, designed for today.
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
          <p>© 2026 Eleganza by Mittali. All Rights Reserved.</p>
          <p>Made with elegance ♡</p>
        </div>
      </footer>
    </main>
  );
}