"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Order = {
  id: number;
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

shiprocket_order_id?: number | null;
shiprocket_shipment_id?: number | null;
shiprocket_awb_code?: string | null;
shiprocket_courier_name?: string | null;
shiprocket_status?: string | null;
shiprocket_tracking_url: string | null;
};

type ExchangeStatus = {
  status: string;

  returnAwbCode?: string | null;
  returnCourierName?: string | null;
  returnTrackingUrl?: string | null;

  exchangeOrderId?: string | null;
  exchangeShipmentId?: string | null;
  exchangeAwbCode?: string | null;
  exchangeCourierName?: string | null;
  exchangeStatus?: string | null;
  exchangeTrackingUrl?: string | null;
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [exchangeStatuses, setExchangeStatuses] =
  useState<Record<number, ExchangeStatus>>({});

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
const { data: exchangeData, error: exchangeError } =
  await supabase
    .from("exchange_requests")
    .select(`
      order_id,
      status,
      shiprocket_return_awb_code,
      shiprocket_return_courier_name,
      shiprocket_return_tracking_url,
      shiprocket_exchange_order_id,
      shiprocket_exchange_shipment_id,
      shiprocket_exchange_awb_code,
      shiprocket_exchange_courier_name,
      shiprocket_exchange_status,
      shiprocket_exchange_tracking_url
    `)
    .eq("customer_email", user.email);

if (exchangeError) {
  console.error(
    "Error loading exchange requests:",
    exchangeError
  );
}

const exchangeStatusMap: Record<
  number,
  ExchangeStatus
> = {};

(exchangeData || []).forEach((exchange) => {
  exchangeStatusMap[exchange.order_id] = {
    status: exchange.status,

    returnAwbCode:
      exchange.shiprocket_return_awb_code,

    returnCourierName:
      exchange.shiprocket_return_courier_name,

    returnTrackingUrl:
      exchange.shiprocket_return_tracking_url,

    exchangeOrderId:
      exchange.shiprocket_exchange_order_id,

    exchangeShipmentId:
      exchange.shiprocket_exchange_shipment_id,

    exchangeAwbCode:
      exchange.shiprocket_exchange_awb_code,

    exchangeCourierName:
      exchange.shiprocket_exchange_courier_name,

    exchangeStatus:
      exchange.shiprocket_exchange_status,

    exchangeTrackingUrl:
      exchange.shiprocket_exchange_tracking_url,
  };
});

setExchangeStatuses(exchangeStatusMap);
  const formattedOrders: Order[] = (data || []).map(
    (order) => ({
      id: order.id,
      orderNumber: order.order_number,
    shiprocketOrderId: order.shiprocket_order_id,
    shiprocketShipmentId: order.shiprocket_shipment_id,
    shiprocketAwbCode: order.shiprocket_awb_code,
    shiprocketCourierName: order.shiprocket_courier_name,

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
shiprocket_order_id: order.shiprocket_order_id,
shiprocket_shipment_id: order.shiprocket_shipment_id,
shiprocket_awb_code: order.shiprocket_awb_code,
shiprocket_courier_name: order.shiprocket_courier_name,
shiprocket_status: order.shiprocket_status,
shiprocket_tracking_url: order.shiprocket_tracking_url,
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
{exchangeStatuses[order.id] && (
  <div className="exchange-order-status">

    <span>EXCHANGE REQUEST</span>

    <strong>
      {exchangeStatuses[order.id].status ===
      "pending"
        ? "🟡 Pending"

        : exchangeStatuses[order.id].status ===
          "approved"
        ? "🟢 Approved"

        : exchangeStatuses[order.id].status ===
          "pickup_requested"
        ? "📦 Pickup Requested"

        : exchangeStatuses[order.id].status ===
          "received"
        ? "📥 Product Received"

        : exchangeStatuses[order.id].status ===
          "exchange_shipped"
        ? "🚚 Exchange Shipped"

        : exchangeStatuses[order.id].status ===
          "completed"
        ? "✅ Exchange Completed"

        : exchangeStatuses[order.id].status ===
          "rejected"
        ? "🔴 Rejected"

        : exchangeStatuses[order.id].status}
    </strong>

    {/* EXCHANGE SHIPMENT */}
    {exchangeStatuses[order.id]
      .exchangeOrderId && (
      <div className="exchange-shipment-info">

        <div className="shipment-detail">
          <span>EXCHANGE SHIPMENT ID</span>

          <strong>
            {
              exchangeStatuses[order.id]
                .exchangeShipmentId
            }
          </strong>
        </div>

        {exchangeStatuses[order.id]
          .exchangeAwbCode && (
          <div className="shipment-detail">
            <span>EXCHANGE AWB</span>

            <strong>
              {
                exchangeStatuses[order.id]
                  .exchangeAwbCode
              }
            </strong>
          </div>
        )}

        {exchangeStatuses[order.id]
          .exchangeCourierName && (
          <div className="shipment-detail">
            <span>COURIER</span>

            <strong>
              {
                exchangeStatuses[order.id]
                  .exchangeCourierName
              }
            </strong>
          </div>
        )}

        {exchangeStatuses[order.id]
          .exchangeTrackingUrl && (
          <a
            href={
              exchangeStatuses[order.id]
                .exchangeTrackingUrl!
            }
            target="_blank"
            rel="noopener noreferrer"
            className="track-order-btn"
          >
            TRACK EXCHANGE →
          </a>
        )}

      </div>
    )}
  </div>
)}
{order.shiprocket_awb_code && (
  <div className="customer-shipment-info">

    <div className="shipment-detail">
      <span>AWB / TRACKING ID</span>

      <strong>
        {order.shiprocket_awb_code}
      </strong>
    </div>

    {order.shiprocket_courier_name && (
      <div className="shipment-detail">
        <span>COURIER</span>

        <strong>
          {order.shiprocket_courier_name}
        </strong>
      </div>
    )}

    {order.shiprocket_tracking_url && (
      <a
        href={order.shiprocket_tracking_url}
        target="_blank"
        rel="noopener noreferrer"
        className="track-order-btn"
      >
        TRACK ORDER →
      </a>
    )}

  </div>
)}
                </div>
                <p className="customer-order-date">
                  {order.date}
                </p>
  {order.shiprocket_awb_code ? (
  <div className="customer-order-tracking">
    <div>
      <span>TRACKING ID</span>
      <strong>{order.shiprocket_awb_code}</strong>
    </div>

    {order.shiprocket_courier_name && (
      <div>
        <span>COURIER</span>
        <strong>{order.shiprocket_courier_name}</strong>
      </div>
    )}

    {order.shiprocket_tracking_url && (
      <a
        href={order.shiprocket_tracking_url}
        target="_blank"
        rel="noopener noreferrer"
        className="track-order-btn"
      >
        TRACK ORDER →
      </a>
    )}
  </div>
) : (
  <div className="customer-order-tracking pending-tracking">
    <span>TRACKING</span>
    <p>
      Tracking will be available once your order is shipped.
    </p>
  </div>
)}

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
          <div>
            <span>TOTAL</span>

            <strong>
              ₹{order.total.toLocaleString("en-IN")}
            </strong>
          </div>

          {order.status === "Delivered" &&
          (!exchangeStatuses[order.id] ||
            exchangeStatuses[order.id].status === "rejected") && (
            <button
              className="exchange-order-btn"
              onClick={() => {
                window.location.href =
                  `/exchange?order=${order.id}`;
              }}
            >
              REQUEST EXCHANGE
            </button>
          )}
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