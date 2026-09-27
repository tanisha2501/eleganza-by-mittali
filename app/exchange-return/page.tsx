"use client";

export default function ExchangeReturnPage() {
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

      {/* PAGE HEADER */}
      <section className="policy-header">
        <p className="small-heading">
          ELEGANZA BY MITTALI
        </p>

        <h1>Exchange & Return Policy</h1>

        <p>
          Please read our exchange policy carefully
          before placing your order.
        </p>
      </section>

      {/* POLICY CONTENT */}
      <section className="policy-content">

        <div className="policy-intro">
          <h2>Exchange Policy</h2>

          <p>
            We do not entertain any returns. Only
            exchanges can be made.
          </p>

          <p>
            All Eleganza by Mittali products have a
            <strong> 7-Day Exchange Policy.</strong>
          </p>

          <p>
            Any item can be exchanged within 7 days
            of delivery for a different size.
          </p>
        </div>

        <div className="policy-block">
          <h2>Eligibility for Exchange</h2>

          <p>
            To be eligible for an exchange, your item
            must be unused, in the same condition in
            which it was delivered and must also be in
            the original packaging.
          </p>

          <p>
            The original invoice as shipped with the
            initial order must be sent back in the
            original packaging.
          </p>

          <p>
            Exchanges are allowed on <strong>size
            issues only.</strong>
          </p>
        </div>

        <div className="policy-block">
          <h2>Items Not Eligible for Exchange</h2>

          <p>
            Unfortunately, we cannot accept exchanges
            on:
          </p>

          <ul>
            <li>Customized products</li>
            <li>Sale items</li>
          </ul>

          <p>
            Please note, you cannot return or exchange
            any product if you had it customised for
            yourself.
          </p>
        </div>

        <div className="policy-block">
          <h2>Reverse Pickup</h2>

          <p>
            If reverse pickup facility is available on
            your pincode, we will arrange a pickup from
            the same place of delivery and re-send the
            exchanged product.
          </p>

          <p>
            Please note that reverse pickup might not
            be available on a few pincodes.
          </p>

          <p>
            In this case, the customer is requested to
            send the product back with the customer's
            name and mobile number clearly mentioned
            on the parcel.
          </p>
        </div>

        <div className="policy-block important-policy">
          <h2>Parcel Opening Video Mandatory</h2>

          <p>
            Customers are required to make a clear
            <strong> unboxing/opening video</strong> while
            opening the parcel.
          </p>

          <p>
            The complete parcel, packaging and product
            should be clearly visible in the video.
            This video is mandatory for verification in
            case of any damage, missing item, wrong
            product or other issue with the order.
          </p>

          <p>
            Without a proper parcel opening video,
            damage or missing-product claims may not
            be considered.
          </p>
        </div>

        <div className="policy-block">
          <h2>International Exchanges</h2>

          <p>
            For international exchanges, the client
            must send the parcel back to our warehouse
            at their own cost.
          </p>

          <p>
            The client will also be responsible for the
            shipping charges for the new order.
          </p>
        </div>

        <div className="policy-block">
          <h2>Damages & Faulty Products</h2>

          <p>
            Eleganza by Mittali is not liable for
            products damaged or lost during shipping
            or transit by our courier partners.
          </p>

          <p>
            If you receive your product damaged, please
            contact the shipment carrier to file the
            claim.
          </p>

          <p>
            Kindly ensure that all packaging material
            and damaged goods are saved before filing a
            claim.
          </p>

          <p>
            Any wrong product or wrong size received
            disputes need to be addressed within
            <strong> 24 hours</strong> with proper proof.
          </p>

          <p>
            In case you have received a faulty product,
            we will definitely replace it, subject to
            verification.
          </p>

          <p>
            A parcel opening/unboxing video is mandatory
            for verification of damage, wrong product,
            missing item or other delivery-related
            issues.
          </p>
        </div>

        <div className="policy-note">
          <strong>Please Note:</strong>

          <p>
            We recommend checking your order carefully
            immediately after delivery and keeping all
            original packaging and invoice until you are
            completely satisfied with your order.
          </p>
        </div>

      </section>

      {/* FOOTER */}
      <footer id="contact">

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