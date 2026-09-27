"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

 const handleLogin = async () => {
  setError("");

  const email = "mittaligoyal2602@gmail.com";

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    setError("Incorrect email or password. Please try again.");
    return;
  }

  window.location.href = "/admin/orders";
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