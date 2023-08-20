const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  productSKU: {
    type: String,
    required: true,
  },
  productMinimumQuantity: {
    type: Number,
    required: true,
  },
  productMinimumPrice: {
    type: Number,
    required: true,
  },
  productDiscount: {
    type: Number,
    required: true,
  },
  productUsers: {
    type: Number,
    default: 0,
  }
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
