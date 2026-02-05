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

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://tagsnag.vercel.app",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use("/auth", authRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err.message));

app.get("/", (_, res) => res.send("Backend OK"));

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

    return res.json(product);
  } catch (err) {
    console.error("❌ /track error:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/products", auth, async (req, res) => {
  try {
    const products = await Product.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Fetch failed" });
  }
});

app.delete("/products/:id", auth, async (req, res) => {
  try {
    const deleted = await Product.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Deleted & tracking stopped" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});

if (process.env.ENABLE_PRICE_CHECKER === "true") {
  setInterval(trackAllProducts, 5 * 60 * 1000);
}


app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));
