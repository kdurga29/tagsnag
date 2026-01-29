"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

function isJwtExpired(token) {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    if (!decoded?.exp) return false;
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now;
  } catch {
    return true;
  }
}

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [checked, setChecked] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || isJwtExpired(token)) {
      localStorage.removeItem("token");
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    setAuthorized(true);
    setChecked(true);
  }, [router, pathname]);
  if (!checked) return null;

  return authorized ? children : null;
}