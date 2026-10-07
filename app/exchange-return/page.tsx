"use client";

export default function ExchangeReturnPage() {
  return (
    <main className="exchange-return-page">
      <div className="exchange-return-box">

        <div className="exchange-success-icon">
          ✓
        </div>

        <p className="account-small-heading">
          ELEGANZA BY MITTALI
        </p>

        <h1>
          Exchange Request Submitted
        </h1>

        <p>
          Your exchange request has been submitted
          successfully. Our team will review your
          request and contact you shortly with the
          next steps.
        </p>

        <a href="/account/orders">
          BACK TO MY ORDERS
        </a>

      </div>
    </main>
  );
}