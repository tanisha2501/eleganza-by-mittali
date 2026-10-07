"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type OrderItem = {
  name: string;
  size: string;
  quantity: number;
};

type Order = {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_mobile: string;
  address: string;
  area: string;
  city: string;
  pincode: string;
  state: string;
  items: OrderItem[];
  status: string;
};

export default function ExchangePage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [reason, setReason] = useState("");
  const [selectedItem, setSelectedItem] =
    useState<OrderItem | null>(null);
  const [newSize, setNewSize] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadOrder = async () => {
      const params = new URLSearchParams(
        window.location.search
      );

      const orderId = params.get("order");

      if (!orderId) {
        setLoading(false);
        return;
      }

      const savedUser = localStorage.getItem(
        "eleganza-current-user"
      );

      if (!savedUser) {
        window.location.href = "/login";
        return;
      }

      const user = JSON.parse(savedUser);

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", Number(orderId))
        .eq("customer_email", user.email)
        .single();

      if (error || !data) {
        console.error(
          "Error loading order:",
          error
        );
        setLoading(false);
        return;
      }

   const formattedOrder: Order = {
  id: data.id,
  order_number: data.order_number,
  customer_name: data.customer_name,
  customer_email: data.customer_email,
  customer_mobile: data.customer_mobile,

  address: data.address || "",
  area: data.area || "",
  city: data.city || "",
  pincode: data.pincode || "",
  state: data.state || "",

  items: data.items || [],
  status: data.status,
};

      setOrder(formattedOrder);

      if (formattedOrder.items.length > 0) {
        setSelectedItem(
          formattedOrder.items[0]
        );
      }

      setLoading(false);
    };

    loadOrder();
  }, []);

  const submitExchangeRequest = async () => {
    if (!order) return;

    if (!selectedItem) {
      alert("Please select a product.");
      return;
    }

    if (!reason) {
      alert("Please select an exchange reason.");
      return;
    }

    if (!newSize) {
      alert("Please select a new size.");
      return;
    }

    try {
      setSubmitting(true);

   const { error } = await supabase
  .from("exchange_requests")
  .insert({
    order_id: order.id,
    order_number: order.order_number,

    customer_name: order.customer_name,
    customer_email: order.customer_email,
    customer_mobile: order.customer_mobile,

    pickup_address: order.address,
    pickup_area: order.area,
    pickup_city: order.city,
    pickup_pincode: order.pincode,
    pickup_state: order.state,
    pickup_country: "India",

    reason,
          exchange_items: [
            {
              product_name:
                selectedItem.name,
              old_size:
                selectedItem.size,
              new_size: newSize,
              quantity:
                selectedItem.quantity,
            },
          ],
          status: "pending",
        });

      if (error) {
        console.error(
          "Exchange request error:",
          error
        );


        alert(
          "Could not submit exchange request."
        );
        return;
      }
      alert(
  "Exchange request submitted successfully! 🎉"
);

window.location.href = "/exchange-return";
    } catch (error) {
      console.error(
        "Exchange submit error:",
        error
      );

      alert(
        "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="exchange-page">
        <div className="exchange-container">
          <p>Loading order...</p>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="exchange-page">
        <div className="exchange-container">
          <h1>Order Not Found</h1>

          <a href="/my-orders">
            BACK TO MY ORDERS
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="exchange-page">
      <div className="exchange-container">
        <p className="account-small-heading">
          ELEGANZA BY MITTALI
        </p>

        <h1>Request Exchange</h1>

        <p className="exchange-order-number">
          Order:{" "}
          <strong>
            {order.order_number}
          </strong>
        </p>

        <div className="exchange-section">
          <h2>Select Product</h2>

          {order.items.map(
            (item, index) => (
              <button
                key={`${item.name}-${index}`}
                type="button"
                className={`exchange-product ${
                  selectedItem === item
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  setSelectedItem(item)
                }
              >
                <strong>
                  {item.name}
                </strong>

                <span>
                  Current Size:{" "}
                  {item.size}
                </span>

                <span>
                  Quantity:{" "}
                  {item.quantity}
                </span>
              </button>
            )
          )}
        </div>

        <div className="exchange-section">
          <h2>Reason for Exchange</h2>

          <select
            value={reason}
            onChange={(e) =>
              setReason(e.target.value)
            }
          >
            <option value="">
              Select a reason
            </option>

            <option value="Size issue">
              Size issue
            </option>

            <option value="Wrong product received">
              Wrong product received
            </option>

            <option value="Damaged product">
              Damaged product
            </option>

            <option value="Product not as expected">
              Product not as expected
            </option>

            <option value="Other">
              Other
            </option>
          </select>
        </div>

        <div className="exchange-section">
          <h2>Choose New Size</h2>

          <div className="size-options">
            {[
              "M",
              "L",
              "XL",
              "XXL",
              "XXXL",
            ].map((size) => (
              <button
                key={size}
                type="button"
                className={
                  newSize === size
                    ? "selected"
                    : ""
                }
                onClick={() =>
                  setNewSize(size)
                }
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="submit-exchange-btn"
          onClick={
            submitExchangeRequest
          }
          disabled={submitting}
        >
          {submitting
            ? "SUBMITTING..."
            : "SUBMIT EXCHANGE REQUEST"}
        </button>

            <a
        href="/account/orders"
        className="back-orders-link"
        >
        ← BACK TO MY ORDERS
        </a>
      </div>
    </main>
  );
}