"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, ArrowRight, Loader2, KeyRound } from "lucide-react";

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const e = searchParams.get("email");
    if (e) setEmail(e);
  }, [searchParams]);

  const handleReset = async (e) => {
    e?.preventDefault();

    const mail = email.trim();
    const c = code.trim();

    if (!mail || !c || !newPassword || !confirm) return alert("Fill all fields");
    if (newPassword !== confirm) return alert("Passwords do not match");
    if (newPassword.length < 6) return alert("Password must be at least 6 characters");

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: mail, code: c, newPassword }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.message || "Reset failed");
        return;
      }

      alert("Password reset successful. Please login.");
      router.push("/login");
    } catch (err) {
      alert("Server error");
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
            Verify Code
          </div>
          <h1 className="authTitle">Set new password</h1>
          <p className="authSub">
            Enter the 6-digit code sent to your email and choose a new password.
          </p>
        </div>

        <form className="authCard" onSubmit={handleReset}>
          <label className="authLabel">Email</label>
          <div className="authField">
            <Mail size={18} />
            <input
              className="authInput"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <label className="authLabel">Reset Code</label>
          <div className="authField">
            <KeyRound size={18} />
            <input
              className="authInput"
              inputMode="numeric"
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
              autoComplete="new-password"
            />
          </div>

          <label className="authLabel">Confirm Password</label>
          <div className="authField">
            <Lock size={18} />
            <input
              className="authInput"
              type="password"
              placeholder="Repeat new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
          </div>

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
            <span>Need a new code?</span>
            <Link className="authLink" href="/forgot-password">
              Send again
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}