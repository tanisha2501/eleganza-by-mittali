"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type ExchangeRequest = {
  id: number;
  order_id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_mobile: string;
  reason: string;
  exchange_items: {
    product_name: string;
    old_size: string;
    new_size: string;
    quantity: number;
  }[];
  status: string;
  pickup_address: string;
pickup_area: string;
pickup_city: string;
pickup_pincode: string;
pickup_state: string;
pickup_country: string;

shiprocket_return_order_id?: string | null;
shiprocket_return_shipment_id?: string | null;
shiprocket_return_awb_code?: string | null;
shiprocket_return_courier_name?: string | null;
shiprocket_return_status?: string | null;
shiprocket_return_tracking_url?: string | null;
  created_at: string;
};

export default function ExchangeRequestsPage() {
  const [requests, setRequests] = useState<
    ExchangeRequest[]
  >([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    const { data, error } = await supabase
      .from("exchange_requests")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Error loading exchange requests:",
        error
      );
      setRequests([]);
      setLoading(false);
      return;
    }

    setRequests(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadRequests();
  }, []);

const arrangePickup = async (request: ExchangeRequest) => {
  try {
    // 1. Get original order details
    const { data: order, error: orderError } =
      await supabase
        .from("orders")
        .select(
          "order_number, customer_name, customer_email, customer_mobile, address, area, city, pincode, state"
        )
        .eq("order_number", request.order_number)
        .single();

    if (orderError || !order) {
      console.error(
        "Original order not found:",
        orderError
      );

      alert(
        "Original order details could not be found."
      );

      return;
    }
        const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      alert("Admin session expired. Please login again.");
      window.location.href = "/admin/login";
      return;
    }

    // 2. Send original order address to Shiprocket
const response = await fetch(
  "/api/shiprocket/create-return",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
        body: JSON.stringify({
          exchange_request_id:
            request.id,

          order_number:
            request.order_number,

          customer_name:
            request.customer_name,

          customer_email:
            request.customer_email,

          customer_mobile:
            request.customer_mobile,

          // Original customer pickup address
          pickup_address:
            order.address,

          pickup_area:
            order.area,

          pickup_city:
            order.city,

          pickup_pincode:
            order.pincode,

          pickup_state:
            order.state,

          pickup_country:
            "India",

          exchange_items:
            request.exchange_items,
        }),
      }
    );

    const result = await response.json();

    console.log(
      "Pickup response:",
      result
    );

    if (!response.ok || !result.success) {
      console.error(
        "Pickup creation failed:",
        result
      );

      alert(
        result.error ||
          "Pickup creation failed."
      );

      return;
    }

    alert(
      "🚚 Exchange pickup created successfully!"
    );

    // Refresh exchange requests
    const { data, error } =
      await supabase
        .from("exchange_requests")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

    if (!error && data) {
      setRequests(data);
    }
  } catch (error) {
    console.error(
      "Arrange pickup error:",
      error
    );

    alert(
      "Something went wrong while arranging pickup."
    );
  }
};
const updateStatus = async (
  id: number,
  status: string
) => {
  try {
    const request = requests.find(
      (item) => item.id === id
    );

    if (!request) {
      alert("Exchange request not found.");
      return;
    }

    // =========================
    // REJECT REQUEST
    // =========================
    // =========================
// DISPATCH EXCHANGE
// =========================
// =========================
// DISPATCH EXCHANGE
// =========================
if (status === "exchange_shipped") {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      alert("Admin session expired. Please login again.");
      window.location.href = "/admin/login";
      return;
    }

    const response = await fetch(
      "/api/shiprocket/create-exchange",
      {
        method: "POST",
       headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
        body: JSON.stringify({
          exchange_request_id: request.id,
          order_number: request.order_number,
          customer_name: request.customer_name,
          customer_email: request.customer_email,
          customer_mobile: request.customer_mobile,
          exchange_items: request.exchange_items,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      console.error(
        "Exchange shipment error:",
        result
      );

      alert(
        result.error ||
          "Exchange shipment could not be created."
      );

      return;
    }

    alert(
      "Exchange shipment created successfully! 🚚📦"
    );

    loadRequests();
    return;
  } catch (error) {
    console.error(
      "Exchange dispatch error:",
      error
    );

    alert(
      "Something went wrong while dispatching the exchange."
    );

    return;
  }
}
    if (status === "rejected") {
      const { error } = await supabase
        .from("exchange_requests")
        .update({
          status: "rejected",
        })
        .eq("id", id);

      if (error) {
        console.error(
          "Reject exchange error:",
          error
        );

        alert("Could not reject exchange request.");
        return;
      }

      alert(
        "Exchange request rejected successfully."
      );

      loadRequests();
      return;
    }

    // =========================
    // APPROVE REQUEST
    // =========================
    if (status === "approved") {
      for (const item of request.exchange_items) {
        const quantity = Number(item.quantity);

        // Find product
        const {
          data: product,
          error: productError,
        } = await supabase
          .from("products")
          .select("id, name, sizes")
          .eq("name", item.product_name)
          .single();

        if (productError || !product) {
          console.error(
            "Product not found:",
            item.product_name,
            productError
          );

          alert(
            `Product "${item.product_name}" not found.`
          );
          return;
        }

        // Existing sizes
        const sizes = product.sizes || {};

        const defaultSizes = {
          ...(sizes.Default || {}),
        };

        const oldSize = item.old_size;
        const newSize = item.new_size;

        const oldStock = Number(
          defaultSizes[oldSize] || 0
        );

        const newStock = Number(
          defaultSizes[newSize] || 0
        );

        // Same size = no stock change
        if (oldSize !== newSize) {
          if (newStock < quantity) {
            alert(
              `Exchange cannot be approved. Only ${newStock} item(s) available in size ${newSize}.`
            );
            return;
          }

          // Old size comes back
          defaultSizes[oldSize] =
            oldStock + quantity;

          // New size goes out
          defaultSizes[newSize] =
            newStock - quantity;
        }

        const updatedSizes = {
          ...sizes,
          Default: defaultSizes,
        };

        // Update product stock
        const { error: stockError } =
          await supabase
            .from("products")
            .update({
              sizes: updatedSizes,
            })
            .eq("id", product.id);

        if (stockError) {
          console.error(
            "Stock update error:",
            stockError
          );

          alert(
            `Could not update stock for ${item.product_name}.`
          );
          return;
        }
      }

      // Mark exchange approved
      const { error: approveError } =
        await supabase
          .from("exchange_requests")
          .update({
            status: "approved",
          })
          .eq("id", id);

      if (approveError) {
        console.error(
          "Exchange approval error:",
          approveError
        );

        alert(
          "Stock was updated but exchange status could not be updated."
        );
        return;
      }

      alert(
        "Exchange approved and stock updated successfully! 🎉"
      );

      loadRequests();
      return;
    }

    // =========================
    // OTHER STATUS UPDATE
    // =========================
    const { error } = await supabase
      .from("exchange_requests")
      .update({
        status,
      })
      .eq("id", id);

    if (error) {
      console.error(
        "Exchange status update error:",
        error
      );

      alert("Could not update exchange status.");
      return;
    }

    loadRequests();
  } catch (error) {
    console.error(
      "Exchange processing error:",
      error
    );

    alert(
      "Something went wrong while processing the exchange."
    );
  }
};

  if (loading) {
    return (
      <main className="admin-exchange-page">
        <div className="admin-exchange-container">
          <p>Loading exchange requests...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-exchange-page">
      <div className="admin-exchange-container">

        <p className="admin-exchange-brand">
          ELEGANZA BY MITTALI
        </p>

        <h1>Exchange Requests</h1>

        <p className="admin-exchange-subtitle">
          Manage customer exchange requests
        </p>

        {requests.length === 0 ? (
          <div className="no-exchange-requests">
            <h2>No Exchange Requests</h2>
            <p>
              There are currently no exchange
              requests.
            </p>
          </div>
        ) : (
          <div className="exchange-request-list">
            {requests.map((request) => (
              <div
                className="exchange-request-card"
                key={request.id}
              >
                <div className="exchange-request-header">
                  <div>
                    <span>ORDER NUMBER</span>

                    <h2>
                      {request.order_number}
                    </h2>
                  </div>

                  <div
                    className={`exchange-status status-${request.status}`}
                  >
                    {request.status}
                  </div>
                </div>

                <div className="exchange-customer">
                  <h3>Customer Details</h3>

                  <p>
                    <strong>Name:</strong>{" "}
                    {request.customer_name}
                  </p>

                  <p>
                    <strong>Email:</strong>{" "}
                    {request.customer_email}
                  </p>

                  <p>
                    <strong>Mobile:</strong>{" "}
                    {request.customer_mobile}
                  </p>
                </div>

                <div className="exchange-product-details">
                  <h3>Exchange Product</h3>

                  {request.exchange_items?.map(
                    (item, index) => (
                      <div
                        className="exchange-item-row"
                        key={index}
                      >
                        <strong>
                          {item.product_name}
                        </strong>

                        <span>
                          Current Size:{" "}
                          {item.old_size}
                        </span>

                        <span>
                          New Size:{" "}
                          {item.new_size}
                        </span>

                        <span>
                          Quantity:{" "}
                          {item.quantity}
                        </span>
                      </div>
                    )
                  )}
                </div>

                <div className="exchange-reason">
                  <h3>Reason</h3>

                  <p>
                    {request.reason}
                  </p>
                </div>

                <div className="exchange-request-date">
                  Requested on:{" "}
                  {new Date(
                    request.created_at
                  ).toLocaleString("en-IN")}
                </div>

                {request.status ===
                  "pending" && (
                  <div className="exchange-admin-actions">
                    <button
                      className="approve-exchange-btn"
                      onClick={() =>
                        updateStatus(
                          request.id,
                          "approved"
                        )
                      }
                    >
                      APPROVE
                    </button>

                    <button
                      className="reject-exchange-btn"
                      onClick={() =>
                        updateStatus(
                          request.id,
                          "rejected"
                        )
                      }
                    >
                      REJECT
                    </button>
          
                  </div>
                )}
{request.status === "approved" && (
  <div className="exchange-admin-actions">
    <button
      className="approve-exchange-btn"
      onClick={() =>
        arrangePickup(request)
      }
    >
      ARRANGE PICKUP
    </button>
  </div>
)}

{request.status === "pickup_requested" && (
  <div className="exchange-admin-actions">
    <button
      className="approve-exchange-btn"
      onClick={() =>
        updateStatus(
          request.id,
          "received"
        )
      }
    >
      PRODUCT RECEIVED
    </button>
  </div>
)}

{request.status === "received" && (
  <div className="exchange-admin-actions">
    <button
      className="approve-exchange-btn"
      onClick={() =>
        updateStatus(
          request.id,
          "exchange_shipped"
        )
      }
    >
      DISPATCH EXCHANGE
    </button>
  </div>
)}

{request.status === "exchange_shipped" && (
  <div className="exchange-admin-actions">
    <button
      className="approve-exchange-btn"
      onClick={() =>
        updateStatus(
          request.id,
          "completed"
        )
      }
    >
      MARK COMPLETED
    </button>
  </div>
)}
              </div>
            ))}
          </div>
        )}
        

      </div>
    </main>
  );
}