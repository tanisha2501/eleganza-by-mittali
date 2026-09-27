"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Order = {
  orderNumber: string;
  customer: {
    name: string;
    mobile: string;
    email: string;
    address: string;
    area: string;
    city: string;
    pincode: string;
    state: string;
  };
  items: {
    name: string;
    size: string;
    quantity: number;
  }[];
  total: number;
  date: string;
  status: string;
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const loadOrders = async () => {
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
    .eq("customer_email", user.email)
    .order("created_at", {
      ascending: false,
    });

if (error) {
  console.error(
    "Error loading customer orders:",
    error
  );
  setOrders([]);
  setLoading(false);
  return;
}
  const formattedOrders: Order[] = (data || []).map(
    (order) => ({
      orderNumber: order.order_number,
      customer: {
        name: order.customer_name,
        mobile: order.customer_mobile,
        email: order.customer_email,
        address: order.address,
        area: order.area,
        city: order.city,
        pincode: order.pincode,
        state: order.state,
      },
      items: order.items || [],
      total: Number(order.total),
      date: new Date(
        order.created_at
      ).toLocaleDateString("en-IN"),
      status: order.status,
    })
  );

  setOrders(formattedOrders);
  setLoading(false);

};

loadOrders();

  const interval = setInterval(loadOrders, 1000);

  return () => clearInterval(interval);
}, []);

  return (
    <main className="my-orders-page">
      <div className="my-orders-container">
        <p className="account-small-heading">
          ELEGANZA BY MITTALI
        </p>

        <h1>My Orders</h1>

  {orders.length === 0 && !loading ? (
  <div className="no-customer-orders">
    <h2>No Orders Yet</h2>
            <p>
              You haven't placed any orders with us yet.
            </p>

            <a href="/">
              START SHOPPING
            </a>
          </div>
        ) : (
          <div className="customer-orders-list">
            {orders.map((order) => (
              <div
                className="customer-order-card"
                key={order.orderNumber}
              >
                <div className="customer-order-header">
                  <div>
                    <span>ORDER NUMBER</span>
                    <h2>{order.orderNumber}</h2>
                  </div>

                  <div
  className={`customer-order-status status-${order.status
    .toLowerCase()
    .replace(" ", "-")}`}
>
  {order.status}
</div>
<div className="order-tracking">
  {["Pending", "Confirmed", "Shipped", "Delivered"].map(
    (status, index) => {
      const statusOrder = [
        "Pending",
        "Confirmed",
        "Shipped",
        "Delivered",
      ];

      const currentIndex =
        statusOrder.indexOf(order.status);

      const isCompleted = index <= currentIndex;

      return (
        <div
          className={`tracking-step ${
            isCompleted ? "completed" : ""
          }`}
          key={status}
        >
          <div className="tracking-dot">
            {isCompleted ? "✓" : ""}
          </div>

          <span>{status}</span>
        </div>
      );
    }
  )}
</div>
                </div>
                <p className="customer-order-date">
                  {order.date}
                </p>

                <div className="customer-order-items">
                  {order.items.map((item, index) => (
                    <div
                      className="customer-order-item"
                      key={`${item.name}-${item.size}-${index}`}
                    >
                      <div>
                        <strong>{item.name}</strong>
                        <p>
                          Size: {item.size} &nbsp; | &nbsp;
                          Quantity: {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="customer-order-footer">
                  <span>TOTAL</span>

                  <strong>
                    ₹{order.total.toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        )}

        <a
          href="/account"
          className="back-account-link"
        >
          ← BACK TO MY ACCOUNT
        </a>
      </div>
    </main>
  );
}