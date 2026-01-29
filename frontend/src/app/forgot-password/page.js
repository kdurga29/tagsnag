"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, ArrowRight, Loader2 } from "lucide-react";

export default function ForgotPassword() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendCode = async (e) => {
    e?.preventDefault();

    const mail = email.trim();
    if (!mail) return alert("Enter your email");

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: mail }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.message || "Failed to send code");
        return;
      }

      router.push(`/reset-password?email=${encodeURIComponent(mail)}`);
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
            Reset Access
          </div>
          <h1 className="authTitle">Forgot password?</h1>
          <p className="authSub">
            Enter your email and we’ll send a 6-digit reset code.
          </p>
        </div>

        <form className="authCard" onSubmit={handleSendCode}>
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

          <button className="authBtnPrimary" type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="spin" size={18} />
                Sending…
              </>
            ) : (
              <>
                Send Code
                <ArrowRight size={18} />
              </>
            )}
          </button>

          <div className="authBottom">
            <span>Remembered it?</span>
            <Link className="authLink" href="/login">
              Back to login
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
