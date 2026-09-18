"use client";

import { useEffect, useState } from "react";

type User = {
  name: string;
  email: string;
  mobile: string;
};

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem(
      "eleganza-current-user"
    );

    if (!savedUser) {
      window.location.href = "/login";
      return;
    }

    setUser(JSON.parse(savedUser));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("eleganza-current-user");
    window.location.href = "/";
  };

  if (!user) {
    return null;
  }

  return (
    <main className="account-page">
      <div className="account-container">
        <p className="account-small-heading">
          ELEGANZA BY MITTALI
        </p>

        <h1>My Account</h1>

        <div className="account-content">
          <div className="account-profile">
            <div className="account-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>

            <div>
              <h2>{user.name}</h2>
              <p>{user.email}</p>
              <p>{user.mobile}</p>
            </div>
          </div>

          <div className="account-actions">
            <a href="/account/orders">
              MY ORDERS
            </a>

            <button onClick={handleLogout}>
              LOGOUT
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}