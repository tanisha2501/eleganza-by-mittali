"use client";

import { useEffect, useState } from "react";

export default function OrderSuccessPage() {
  const [orderNumber, setOrderNumber] = useState("");

 useEffect(() => {
  const savedOrderNumber =
    localStorage.getItem("eleganza-last-order");

  if (savedOrderNumber) {
    setOrderNumber(savedOrderNumber);
  }
}, []);

  return (
    <main className="order-success-page">
      <div className="order-success-box">

        <div className="success-icon">✓</div>

        <p className="success-small-heading">
          ELEGANZA BY MITTALI
        </p>

        <h1>Order Confirmed</h1>

        <p className="success-message">
          Thank you for shopping with us.
          Your order has been placed successfully.
        </p>

        <div className="order-number">
          <span>ORDER NUMBER</span>
          <strong>{orderNumber}</strong>
        </div>

        <p className="success-note">
          We will contact you shortly with your
          order and delivery details.
        </p>

        <a
          href="/"
          className="continue-shopping-btn"
        >
          CONTINUE SHOPPING
        </a>

      </div>
    </main>
  );
}