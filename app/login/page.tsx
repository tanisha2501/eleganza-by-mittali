"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState("");
const [showPassword, setShowPassword] = useState(false);

const handleLogin = async () => {
  setError("");

  if (!email || !password) {
    setError("Please enter your email and password.");
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) {
    setError("Invalid email or password.");
    return;
  }

  if (!data.user) {
    setError("Unable to log in. Please try again.");
    return;
  }

  localStorage.setItem(
    "eleganza-current-user",
    JSON.stringify({
      name: data.user.user_metadata?.name || "",
      email: data.user.email || email,
      mobile: data.user.user_metadata?.mobile || "",
    })
  );

  const checkoutRedirect = localStorage.getItem(
    "eleganza-checkout-redirect"
  );

  if (checkoutRedirect === "true") {
    localStorage.removeItem("eleganza-checkout-redirect");
    window.location.href = "/checkout";
  } else {
    window.location.href = "/";
  }
};

  return (
    <main className="auth-page">
      <div className="auth-box">
        <p className="auth-brand">
          ELEGANZA BY MITTALI
        </p>

        <h1>Welcome Back</h1>

        <p className="auth-subtitle">
          Login to continue shopping with us.
        </p>

        <div className="auth-form">
          <label>EMAIL</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
          />

          <label>PASSWORD</label>

          <div className="password-field">
  <input
    type={showPassword ? "text" : "password"}
    placeholder="Enter your password"
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

  <button
    type="button"
    className="password-eye"
    onClick={() => setShowPassword(!showPassword)}
  >
    {showPassword ? (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" />
    <circle cx="12" cy="12" r="2.5" />
  </svg>
) : (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 3l18 18" />
    <path d="M10.6 10.6a2.5 2.5 0 0 0 3.5 3.5" />
    <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c7 0 10 8 10 8a18.4 18.4 0 0 1-3.1 4.3" />
    <path d="M6.1 6.1C3.4 8 2 12 2 12s3.5 8 10 8c1.5 0 2.8-.3 4-.8" />
  </svg>
)}
  </button>
</div>

          {error && (
            <p className="auth-error">
              {error}
            </p>
          )}

          <button
            className="auth-btn"
            onClick={handleLogin}
          >
            LOGIN
          </button>
        </div>

        <p className="auth-switch">
          Don't have an account?{" "}
          <a href="/register">REGISTER</a>
        </p>
      </div>
    </main>
  );
}