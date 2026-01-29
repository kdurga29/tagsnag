"use client";

import { useState, useContext } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthContext } from "../context/AuthContext";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!email || !password) return alert("Enter email and password");

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        login(data.token);

        const next = searchParams.get("next");
        router.push(next ? next : "/dashboard");
      } else {
        alert(data.message || "Login failed");
      }
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
            Secure Access
          </div>
          <h1 className="authTitle">Welcome back</h1>
          <p className="authSub">Login to continue tracking your products.</p>
        </div>

        <form className="authCard" onSubmit={handleLogin}>
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

          <label className="authLabel">Password</label>
          <div className="authField">
            <Lock size={18} />
            <input
              className="authInput"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}>
            <Link className="authLink" href="/forgot-password">
              Forgot password?
            </Link>
          </div>

          <button className="authBtnPrimary" type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="spin" size={18} />
                Logging in…
              </>
            ) : (
              <>
                Login
                <ArrowRight size={18} />
              </>
            )}
          </button>

          <div className="authBottom">
            <span>Don’t have an account?</span>
            <Link className="authLink" href="/signup">
              Sign up
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
