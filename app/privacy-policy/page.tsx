"use client";

export default function PrivacyPolicyPage() {
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
        <h1>Privacy Policy</h1>
        <p>
          Your privacy is important to us. This policy explains how we
          collect, use and protect your information.
        </p>
      </section>

      <section className="policy-content">
        <div className="policy-intro">
          <h2>Information We Collect</h2>
          <p>
            When you place an order or interact with our website, we may
            collect information such as your name, mobile number, email
            address and delivery details including address, area, city,
            state and pincode.
          </p>
        </div>

        <div className="policy-block">
          <h2>How We Use Your Information</h2>
          <p>
            The information collected is used to process and deliver your
            orders, communicate with you regarding your order, provide
            customer support and improve our website and services.
          </p>
        </div>

        <div className="policy-block">
          <h2>Payment Information</h2>
          <p>
            Online payments are processed through Razorpay. Payment
            information required for processing the transaction is handled
            through the payment service provider.
          </p>
          <p>
            We may retain transaction-related information such as payment
            status and payment reference details for order processing and
            record-keeping.
          </p>
        </div>

        <div className="policy-block">
          <h2>Order Information</h2>
          <p>
            Information related to your order may be stored so that we can
            manage your purchase, provide order updates, handle exchanges
            and provide customer support when required.
          </p>
        </div>

        <div className="policy-block">
          <h2>Information Sharing</h2>
          <p>
            We do not sell your personal information. Information may be
            shared with service providers such as payment processors and
            delivery or courier partners when necessary to process and
            deliver your order.
          </p>
        </div>

        <div className="policy-block">
          <h2>Data Security</h2>
          <p>
            We take reasonable measures to protect the information provided
            through our website. However, no method of transmission or
            electronic storage can be guaranteed to be completely secure.
          </p>
        </div>

        <div className="policy-block">
          <h2>Cookies and Website Usage</h2>
          <p>
            Our website may use browser storage or similar technologies to
            maintain certain website functionality, such as shopping cart,
            wishlist or login-related information.
          </p>
        </div>

        <div className="policy-block">
          <h2>Third-Party Services</h2>
          <p>
            Our website may use third-party services for payment processing,
            hosting, analytics or other website functionality. These
            services may process information according to their own privacy
            policies.
          </p>
        </div>

        <div className="policy-block">
          <h2>Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy or how your
            information is handled, you can contact Eleganza by Mittali
            through our Contact page.
          </p>
        </div>

        <div className="policy-note">
          <strong>Privacy Commitment:</strong>
          <p>
            Eleganza by Mittali respects your privacy and uses customer
            information only for legitimate business and service-related
            purposes.
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
            <a href="/return-exchange-policy">Exchange & Return</a>
            <a href="/shipping">Shipping & Delivery</a>
            <a href="/privacy-policy">Privacy Policy</a>
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