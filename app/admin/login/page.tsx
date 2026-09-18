"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (password === "Eleganza@123") {
      localStorage.setItem("eleganza-admin", "true");
      window.location.href = "/admin/orders";
    } else {
      setError("Incorrect password. Please try again.");
    }
  };

  return (
    <main className="admin-login-page">
      <div className="admin-login-box">

        <p className="admin-login-brand">
          ELEGANZA BY MITTALI
        </p>

        <h1>Admin Login</h1>

        <p className="admin-login-subtitle">
          Sign in to manage your orders.
        </p>

        <div className="admin-login-form">
          <label>Password</label>

          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleLogin();
              }
            }}
          />

          {error && (
            <p className="admin-login-error">
              {error}
            </p>
          )}

          <button
            className="admin-login-btn"
            onClick={handleLogin}
          >
            LOGIN
          </button>
        </div>

      </div>
    </main>
  );
}