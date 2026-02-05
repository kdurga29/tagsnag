"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sun, Moon, LogOut, LayoutDashboard, LogIn } from "lucide-react";

export default function Navbar({ theme, setTheme }) {
  const pathname = usePathname();
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isHome = pathname === "/";

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    router.push("/");
  };

  return (
    <header className="ts-nav">
      <div className="ts-nav__inner">
        {/* Brand */}
        <Link href="/" className="ts-brand">
          <span className="ts-brand__dot" />
          <span className="ts-brand__text">TagSnag</span>
        </Link>

        {/* Actions */}
        <div className="ts-nav__actions">
          {/* ✅ HOME PAGE: show ONLY Login/Signup if logged out.
              ✅ If logged in, show NOTHING (no dashboard/logout). */}
          {isHome && !isLoggedIn && (
            <div className="ts-nav__group">
              <Link href="/login" className="ts-pill ts-pill--ghost">
                <LogIn size={16} />
                <span>Login</span>
              </Link>

              <Link href="/signup" className="ts-pill ts-pill--primary">
                Sign up
              </Link>
            </div>
          )}

          {/* ✅ Other pages: Logged in users can see dashboard/logout */}
          {!isHome && isLoggedIn && (
            <div className="ts-nav__group">
              {pathname !== "/dashboard" && (
                <Link href="/dashboard" className="ts-pill ts-pill--ghost">
                  <LayoutDashboard size={16} />
                  <span>Dashboard</span>
                </Link>
              )}

              <button
                type="button"
                className="ts-pill ts-pill--danger"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}

          {/* ✅ Hide login/signup buttons on auth pages */}
          {!isHome && !isLoggedIn && !isAuthPage && null}

          {/* Theme toggle always visible */}
          <button
            type="button"
            className="ts-iconBtn"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}
