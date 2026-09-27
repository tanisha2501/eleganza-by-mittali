"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    totalReviews: 0,
    lowStock: 0,
    totalSales: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);

  useEffect(() => {
    const loadDashboard = async () => {
      const { data: userData } =
        await supabase.auth.getUser();

      const user = userData.user;

      if (!user) {
        window.location.href = "/admin/login";
        return;
      }

      if (
        user.email !==
        "mittaligoyal2602@gmail.com"
      ) {
        await supabase.auth.signOut();
        window.location.href = "/admin/login";
        return;
      }

const [
  ordersResult,
  productsResult,
  reviewsResult,
  recentOrdersResult,
] = await Promise.all([
  supabase
    .from("orders")
    .select("status, total"),

  supabase
    .from("products")
    .select("name, sizes"),

  supabase
    .from("product_reviews")
    .select("id"),

  supabase
    .from("orders")
    .select(
      "id, order_number, customer_name, total, status, payment_method, created_at"
    )
    .order("created_at", {
      ascending: false,
    })
    .limit(5),
]);

      const orders = ordersResult.data || [];
      const products = productsResult.data || [];
      const reviews = reviewsResult.data || [];
      setRecentOrders(
  recentOrdersResult.data || []
);

      const pendingOrders = orders.filter(
        (order) =>
          order.status?.toLowerCase() ===
          "pending"
      ).length;

      const totalSales = orders.reduce(
        (sum, order) =>
          sum + Number(order.total || 0),
        0
      );

let lowStock = 0;

const lowStockList: any[] = [];

products.forEach((product) => {
  const sizes = product.sizes;

  if (
    !sizes ||
    typeof sizes !== "object"
  ) {
    return;
  }

  let hasLowStock = false;

  Object.entries(sizes).forEach(
    ([key, value]: [string, any]) => {

      if (typeof value === "number") {
        if (
          value >= 1 &&
          value <= 3
        ) {
          hasLowStock = true;

          lowStockList.push({
            productName: product.name,
            colour: null,
            size: key,
            stock: value,
          });
        }

        return;
      }

      if (
        typeof value === "object" &&
        value !== null
      ) {
        Object.entries(value).forEach(
          ([size, stock]: [string, any]) => {

            if (
              typeof stock === "number" &&
              stock >= 1 &&
              stock <= 3
            ) {
              hasLowStock = true;

              lowStockList.push({
                productName: product.name,
                colour: key,
                size,
                stock,
              });
            }
          }
        );
      }
    }
  );

  if (hasLowStock) {
    lowStock++;
  }
});

setLowStockItems(lowStockList);

      setStats({
        totalOrders: orders.length,
        pendingOrders,
        totalProducts: products.length,
        totalReviews: reviews.length,
        lowStock,
        totalSales,
      });

      setLoading(false);
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <main className="admin-page">
        <div className="admin-container">
          <p>Loading dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <div className="admin-container">

        <div className="admin-header">

          <div>
            <p className="admin-small-heading">
              ELEGANZA BY MITTALI
            </p>

            <h1>Dashboard</h1>

            <p>
              Manage your store and monitor
              your business activity.
            </p>
          </div>

          <button
            type="button"
            className="admin-logout-btn"
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href =
                "/admin/login";
            }}
          >
            LOGOUT
          </button>

        </div>

        <nav className="admin-nav">

          <a href="/admin/dashboard">
            Dashboard
          </a>

          <a href="/admin/orders">
            Orders
          </a>

          <a href="/admin/products/add">
            Add Product
          </a>

          <a href="/admin/reviews">
            Reviews
          </a>

        </nav>

        <div className="dashboard-grid">

          <div className="dashboard-card">
            <span>📦</span>

            <p>Total Orders</p>

            <h2>
              {stats.totalOrders}
            </h2>
          </div>

          <div className="dashboard-card">
            <span>⏳</span>

            <p>Pending Orders</p>

            <h2>
              {stats.pendingOrders}
            </h2>
          </div>

          <div className="dashboard-card">
            <span>🛍️</span>

            <p>Total Products</p>

            <h2>
              {stats.totalProducts}
            </h2>
          </div>

          <div className="dashboard-card">
            <span>⭐</span>

            <p>Total Reviews</p>

            <h2>
              {stats.totalReviews}
            </h2>
          </div>

          <div className="dashboard-card">
            <span>⚠️</span>

            <p>Low Stock</p>

            <h2>
              {stats.lowStock}
            </h2>
          </div>

          <div className="dashboard-card">
            <span>💰</span>

            <p>Total Sales</p>

            <h2>
              ₹
              {stats.totalSales.toLocaleString(
                "en-IN"
              )}
            </h2>
          </div>

        </div>
        <div className="recent-orders-section">
<div className="low-stock-section">

  <div className="low-stock-header">
    <div>
      <p className="admin-small-heading">
        INVENTORY ALERT
      </p>

      <h2>Low Stock Products</h2>
    </div>

    <span className="low-stock-count">
      {lowStockItems.length} Items
    </span>
  </div>

  {lowStockItems.length === 0 ? (
    <div className="low-stock-empty">
      <span>✓</span>
      <p>
        All products have sufficient stock.
      </p>
    </div>
  ) : (
    <div className="low-stock-list">

      {lowStockItems.map(
        (item, index) => (
          <div
            className="low-stock-item"
            key={`${item.productName}-${item.colour}-${item.size}-${index}`}
          >

            <div className="low-stock-product">
              <strong>
                {item.productName}
              </strong>

              <span>
                {item.colour
                  ? `${item.colour} • Size ${item.size}`
                  : `Size ${item.size}`}
              </span>
            </div>

            <div className="low-stock-quantity">
              <strong>
                {item.stock}
              </strong>

              <span>left</span>
            </div>

            <a
              href={`/admin/products/edit?name=${encodeURIComponent(
                item.productName
              )}`}
              className="low-stock-edit"
            >
              EDIT
            </a>

          </div>
        )
      )}

    </div>
  )}

</div>
  <div className="recent-orders-header">
    <div>
      <p className="admin-small-heading">
        STORE ACTIVITY
      </p>

      <h2>Recent Orders</h2>
    </div>

    <a
      href="/admin/orders"
      className="view-all-orders"
    >
      View All Orders
    </a>
  </div>

  {recentOrders.length === 0 ? (
    <div className="recent-orders-empty">
      <p>No orders yet.</p>
    </div>
  ) : (
    <div className="recent-orders-list">

      {recentOrders.map((order) => (
        <div
          className="recent-order-card"
          key={order.id}
        >

          <div className="recent-order-info">

            <strong>
              #{order.order_number}
            </strong>

            <span>
              {order.customer_name}
            </span>

          </div>

          <div className="recent-order-payment">
            <span>
              {order.payment_method === "online"
                ? "Online Payment"
                : "COD"}
            </span>
          </div>

          <div className="recent-order-amount">
            ₹
            {Number(
              order.total || 0
            ).toLocaleString("en-IN")}
          </div>

          <div
            className={`recent-order-status status-${String(
              order.status || ""
            )
              .toLowerCase()
              .replace(/\s+/g, "-")}`}
          >
            {order.status}
          </div>

                    <a
            href={`/admin/orders?order=${encodeURIComponent(
                order.order_number
            )}`}
            className="recent-order-view"
            >
            View Order
            </a>
        </div>
      ))}

    </div>
  )}

</div>
        <div className="dashboard-welcome">

          <h2>
            Welcome to Eleganza by Mittali
          </h2>

          <p>
            Use the navigation above to manage
            orders, products and customer reviews.
          </p>

        </div>

      </div>
    </main>
  );
}