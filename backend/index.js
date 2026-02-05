const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const auth = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const Product = require("./models/Product");

const { getMyntraProduct } = require("./utils/myntraScraper");
const { trackAllProducts } = require("./utils/priceChecker");

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:3000",
  "https://tagsnag.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (origin.endsWith(".vercel.app")) return callback(null, true);
      return callback(new Error("Not allowed by CORS: " + origin), false);
    },
  })
);

app.use(express.json());

app.use("/auth", authRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((e) => console.error("❌ MongoDB error:", e.message));

app.get("/health", (_, res) => res.json({ ok: true }));

app.post("/track", auth, async (req, res) => {
  try {
    const { link } = req.body;

    if (!link || !link.includes("myntra.com")) {
      return res.status(400).json({ message: "Only Myntra supported" });
    }

    const data = await getMyntraProduct(link);
    if (!data) return res.status(500).json({ message: "Scrape failed" });

    let product = await Product.findOne({ link, user: req.userId });

    if (!product) {
      product = await Product.create({
        user: req.userId,
        link,
        title: data.title,
        image: data.image,
        initialPrice: data.price,
        price: data.price,
        priceHistory: [{ price: data.price, date: new Date() }],
      });
    }

    res.json(product);
  } catch (err) {
    console.error("❌ /track error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/products", auth, async (req, res) => {
  try {
    const products = await Product.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error("❌ /products error:", err.message);
    res.status(500).json({ message: "Fetch failed" });
  }
});

app.delete("/products/:id", auth, async (req, res) => {
  try {
    await Product.findOneAndDelete({ _id: req.params.id, user: req.userId });
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("❌ delete error:", err.message);
    res.status(500).json({ message: "Delete failed" });
  }
});

setInterval(trackAllProducts, 5 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
