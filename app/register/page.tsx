"use client";

import { useState } from "react";


export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = () => {
    setError("");

    if (!name || !email || !mobile || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    const existingUsers = JSON.parse(
      localStorage.getItem("eleganza-users") || "[]"
    );

    const userExists = existingUsers.some(
      (user: { email: string }) =>
        user.email.toLowerCase() === email.toLowerCase()
    );

    if (userExists) {
      setError("An account with this email already exists.");
      return;
    }

    const newUser = {
      name,
      email,
      mobile,
      password,
    };

    existingUsers.push(newUser);

    localStorage.setItem(
      "eleganza-users",
      JSON.stringify(existingUsers)
    );

    window.location.href = "/login";
  };

  return (
    <main className="auth-page">
      <div className="auth-box">
        <p className="auth-brand">ELEGANZA BY MITTALI</p>

        <h1>Create Account</h1>

        <p className="auth-subtitle">
          Register to continue shopping with us.
        </p>

        <div className="auth-form">
          <label>FULL NAME</label>
          <input
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label>EMAIL</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>MOBILE NUMBER</label>
          <input
            type="tel"
            placeholder="Enter your mobile number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />

          <div className="password-field">
  <input
    type={showPassword ? "text" : "password"}
    placeholder="Create a password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
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

          <div className="password-field">
  <input
    type={showConfirmPassword ? "text" : "password"}
    placeholder="Confirm your password"
    value={confirmPassword}
    onChange={(e) => setConfirmPassword(e.target.value)}
  />

  <button
    type="button"
    className="password-eye"
    onClick={() =>
      setShowConfirmPassword(!showConfirmPassword)
    }
  >
   {showConfirmPassword ? (
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
            onClick={handleRegister}
          >
            REGISTER
          </button>
        </div>

        <p className="auth-switch">
          Already have an account?{" "}
          <a href="/login">LOGIN</a>
        </p>
      </div>
    </main>
  );
}