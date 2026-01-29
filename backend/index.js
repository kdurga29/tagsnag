const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const auth = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const Product = require("./models/Product");
const User = require("./models/User");

const { getMyntraProduct } = require("./utils/myntraScraper");
const { sendPriceDropEmail } = require("./utils/mailer");
const { trackAllProducts } = require("./utils/priceChecker");

const app = express();
const PORT = 5000;

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

app.use("/auth", authRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(console.error);

app.post("/track", auth, async (req, res) => {
  const { link } = req.body;

  if (!link.includes("myntra.com"))
    return res.status(400).json({ message: "Only Myntra supported" });

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
});

app.get("/products", auth, async (req, res) => {
  const products = await Product.find({ user: req.userId });
  res.json(products);
});

app.delete("/products/:id", auth, async (req, res) => {
  await Product.findOneAndDelete({ _id: req.params.id, user: req.userId });
  res.json({ message: "Deleted" });
});

setInterval(trackAllProducts, 5 * 60 * 1000);

app.listen(PORT, () =>
  console.log(`🚀 Backend running on http://localhost:${PORT}`)
);
