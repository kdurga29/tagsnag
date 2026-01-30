"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "../components/ProtectedRoute";
import { ChevronLeft, ChevronRight } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const router = useRouter();
  const railRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [productLink, setProductLink] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuthFail = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return handleAuthFail();

      const res = await fetch(`${API}/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) return handleAuthFail();

      const data = await res.json().catch(() => []);
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch products error:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAdd = async () => {
    const link = productLink.trim();
    if (!link) {
      alert("Paste a Myntra link first");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Login again. Token missing.");
      return handleAuthFail();
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/track`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ link }),
      });

      if (res.status === 401) return handleAuthFail();

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.message || "Track failed");
        return;
      }

      setProductLink("");
      await fetchProducts();
    } catch (err) {
      console.error("Track request error:", err);
      alert("Network error: backend not reachable / CORS / server down");
    } finally {
      setLoading(false);
    }
  };

  const scrollRail = (dir) => {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({
      left: dir * Math.round(el.clientWidth * 0.9),
      behavior: "smooth",
    });
  };

  return (
    <main className="dashboard animate-in">
      <div className="dash-top">
        <h2 className="dashboard-title">Tracked Products</h2>
        <p className="dash-sub">Add a Myntra link to start tracking price history.</p>
      </div>

      <div className="add-bar">
        <input
          value={productLink}
          onChange={(e) => setProductLink(e.target.value)}
          placeholder="Paste Myntra product link..."
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
        />
        <button onClick={handleAdd} disabled={loading}>
          {loading ? "Adding..." : "Add"}
        </button>
      </div>

      <div className="rail-wrap">
        <button className="rail-btn left" type="button" onClick={() => scrollRail(-1)}>
          <ChevronLeft size={18} />
        </button>

        <div className="product-row" ref={railRef}>
          {products.length === 0
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="product-tile skeleton-card">
                  <div className="tile-image skeleton-img" />
                  <div className="tile-title skeleton-text" />
                  <button className="track-btn skeleton-btn" disabled />
                </div>
              ))
            : products.map((p) => (
                <div key={p._id} className="product-tile">
                  <div className="tile-image">
                    <img src={p.image} alt={p.title} />
                  </div>

                  <div className="tile-title">{p.title}</div>

                  <button className="track-btn" onClick={() => router.push(`/product/${p._id}`)}>
                    Track
                  </button>
                </div>
              ))}
        </div>

        <button className="rail-btn right" type="button" onClick={() => scrollRail(1)}>
          <ChevronRight size={18} />
        </button>
      </div>
    </main>
  );
}
