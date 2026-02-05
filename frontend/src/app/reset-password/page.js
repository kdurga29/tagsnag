"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ArrowRight, Loader2, KeyRound } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPassword />
    </Suspense>
  );
}

function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !code || !newPassword) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || "Reset failed");
        return;
      }

      setSuccess("Password reset successful. Please login.");
      setTimeout(() => router.push("/login"), 900);
    } catch {
      setError("Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="authPage">
      <section className="authShell animate-in">
        <div className="authHeader">
          <div className="authBadge">
            <span className="authDot" />
            Reset Password
          </div>
          <h1 className="authTitle">Set a new password</h1>
          <p className="authSub">Enter the code sent to your email.</p>
        </div>

        <form className="authCard" onSubmit={handleSubmit}>
          <label className="authLabel">Email</label>
          <div className="authField">
            <Mail size={18} />
            <input
              className="authInput"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <label className="authLabel">Reset Code</label>
          <div className="authField">
            <KeyRound size={18} />
            <input
              className="authInput"
              placeholder="6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>

          <label className="authLabel">New Password</label>
          <div className="authField">
            <Lock size={18} />
            <input
              className="authInput"
              type="password"
              placeholder="Create a new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          {error && <p className="authError">{error}</p>}
          {success && <p className="authSuccess">{success}</p>}

          <button className="authBtnPrimary" type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="spin" size={18} />
                Resetting…
              </>
            ) : (
              <>
                Reset Password
                <ArrowRight size={18} />
              </>
            )}
          </button>

          <div className="authBottom">
            <Link className="authLink" href="/login">
              Back to login
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
