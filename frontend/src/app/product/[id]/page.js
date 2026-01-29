"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "../../components/ProtectedRoute";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ArrowLeft } from "lucide-react";

export default function ProductPage() {
  return (
    <ProtectedRoute>
      <ProductContent />
    </ProtectedRoute>
  );
}

function ProductContent() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/products", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      const data = await res.json();
      const found = Array.isArray(data)
        ? data.find((p) => p._id === id)
        : null;

      setProduct(found || null);
    };

    fetchProduct();
  }, [id, router]);

  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:5000/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401) {
      localStorage.removeItem("token");
      router.push("/login");
      return;
    }

    router.push("/dashboard");
  };

  if (!product) {
    return (
      <main>
        <div className="product-grid">
          <div className="skeleton card" />
          <div className="skeleton graph" />
        </div>
      </main>
    );
  }

  return (
    <main>
      <button
        onClick={() => router.push("/dashboard")}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 18,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          fontWeight: 800,
          color: "hsl(var(--ink))",
        }}
      >
      </button>

      <div className="product-grid animate-in">
        <div className="product-card equal-height">
          <div>
            <h2 className="title" style={{ margin: 0, fontWeight: 950 }}>
              {product.title}
            </h2>
            <p className="price" style={{ marginTop: 8 }}>
              <strong>Current Price:</strong> ₹{product.price}
            </p>
          </div>

          <div className="image-wrapper">
            <img src={product.image} alt={product.title} />
          </div>

          <button className="delete-btn" onClick={handleDelete}>
            Delete Product
          </button>
        </div>

        <div className="graph-card equal-height">
          <h3 style={{ margin: 0 }}>Price History</h3>

          {product.priceHistory?.length > 0 ? (
            <div className="graph-box">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={product.priceHistory}>
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) => new Date(d).toLocaleDateString()}
                  />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#7b4a1f"
                    strokeWidth={3}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p style={{ color: "hsl(var(--muted))", fontWeight: 700 }}>
              No price history available yet.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
