const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    link: String,
    title: String,
    image: String,
    initialPrice: Number,
    price: Number,
    priceHistory: [
      {
        price: Number,
        date: Date,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
