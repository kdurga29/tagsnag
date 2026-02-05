"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.password) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        router.push("/login");
      } else {
        setError(data.message || "Signup failed");
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
            Create Account
          </div>
          <h1 className="authTitle">Join TagSnag</h1>
        </div>

        <form className="authCard" onSubmit={handleSubmit}>
          <label className="authLabel">Name</label>
          <div className="authField">
            <User size={18} />
            <input
              className="authInput"
              placeholder="Your name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />
          </div>

          <label className="authLabel">Email</label>
          <div className="authField">
            <Mail size={18} />
            <input
              className="authInput"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />
          </div>

          <label className="authLabel">Password</label>
          <div className="authField">
            <Lock size={18} />
            <input
              className="authInput"
              type="password"
              placeholder="Create a password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />
          </div>

          {error && (
            <p className="authError">
              {error}
            </p>
          )}

          <button className="authBtnPrimary" type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="spin" size={18} />
                Creating…
              </>
            ) : (
              <>
                Create Account
                <ArrowRight size={18} />
              </>
            )}
          </button>

          <div className="authBottom">
            <span>Already have an account?</span>
            <Link className="authLink" href="/login">
              Login
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
