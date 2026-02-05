"use client";

import { Suspense, useState, useContext } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthContext } from "../context/AuthContext";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <Login />
    </Suspense>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useContext(AuthContext);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Enter email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        login(data.token);
        router.push(searchParams.get("next") || "/dashboard");
      } else {
        setError(data.message || "Invalid credentials");
      }
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
            />
          </div>

          {error && (
            <p className="authError">
              {error}
            </p>
          )}

          <div className="authExtras">
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
