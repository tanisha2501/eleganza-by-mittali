"use client";

export default function TermsConditionsPage() {
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
        <h1>Terms & Conditions</h1>
        <p>
          Please read these terms carefully before placing an order with us.
        </p>
      </section>

      <section className="policy-content">
        <div className="policy-intro">
          <h2>Website Usage</h2>
          <p>
            By using the Eleganza by Mittali website, you agree to follow
            these Terms & Conditions and the applicable policies of our
            website.
          </p>
        </div>

        <div className="policy-block">
          <h2>Customer Account</h2>
          <p>
            Creating a customer account is mandatory to place an order on
            our website. Customers are responsible for providing accurate
            information and keeping their account details secure.
          </p>
        </div>

        <div className="policy-block">
          <h2>Orders</h2>
          <p>
            Orders can be placed through our website after selecting the
            required product, colour, size and other available options.
          </p>
          <p>
            An order is subject to product availability and successful order
            confirmation.
          </p>
        </div>

        <div className="policy-block">
          <h2>Order Cancellation</h2>
          <p>
            Customers may request cancellation of an order before the order
            has been shipped.
          </p>
          <p>
            Once an order has been shipped, it cannot be cancelled.
          </p>
        </div>

        <div className="policy-block">
          <h2>Payment</h2>
          <p>
            We accept both Cash on Delivery (COD) and online payments.
          </p>
          <p>
            Online payments are processed securely through Razorpay.
          </p>
        </div>

        <div className="policy-block">
          <h2>Product Pricing</h2>
          <p>
            Product prices are displayed on the website and may change when
            a sale, promotional offer or discount is applicable.
          </p>
          <p>
            The applicable price at the time of placing the order will be
            considered for the purchase.
          </p>
        </div>

        <div className="policy-block">
          <h2>Product Availability</h2>
          <p>
            Products and sizes are subject to availability. We may update
            product availability and stock information from time to time.
          </p>
        </div>

        <div className="policy-block">
          <h2>Shipping & Delivery</h2>
          <p>
            Orders are generally processed and dispatched within 2–3 working
            days.
          </p>
          <p>
            For detailed delivery timelines and shipping information, please
            refer to our Shipping & Delivery policy.
          </p>
        </div>

        <div className="policy-block">
          <h2>Exchange & Return</h2>
          <p>
            Exchanges are subject to the conditions mentioned in our
            Exchange & Return policy.
          </p>
          <p>
            Customers are requested to review the exchange policy before
            placing an order.
          </p>
        </div>

        <div className="policy-block">
          <h2>Changes to These Terms</h2>
          <p>
            Eleganza by Mittali may update these Terms & Conditions from
            time to time. Any updated terms will be published on this page.
          </p>
        </div>

        <div className="policy-note">
          <strong>Important:</strong>
          <p>
            By placing an order through our website, you acknowledge that you
            have read and agreed to these Terms & Conditions along with our
            applicable shipping, exchange and privacy policies.
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
