const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const authMiddleware = require("../middleware/auth");
const Product = require("../models/product");

const router = express.Router();

router.post("/add", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (!user.isBrand) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const {
      productName,
      productSKU,
      productMinimumQuantity,
      productMinimumPrice,
      productDiscount,
    } = req.body;

    // Create a new product
    const product = new Product({
      brandId: user._id,
      productName: productName,
      productSKU: productSKU,
      productMinimumQuantity: productMinimumQuantity,
      productMinimumPrice: productMinimumPrice,
      productDiscount: productDiscount,
    });

    // Save the product to the database
    await product.save();

    res.status(201).json({ message: "Product created" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/products", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (!user.isBrand) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const products = await Product.find({ brandId: user._id });
    res.status(200).json({ products: products });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/delete/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (!user.isBrand) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const product = await Product.findOne({ _id: req.params.id });
    if (!product) {
      return res.status(401).json({ message: "Invalid Product" });
    }
    if (product.brandId != user._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    product.delete();
    res.status(200).json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/update/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (!user.isBrand) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const product = await Product.findOne({ _id: req.params.id });
    if (!product) {
      return res.status(401).json({ message: "Invalid Product" });
    }
    if (product.brandId != user._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const {
      productName,
      productSKU,
      productMinimumQuantity,
      productMinimumPrice,
      productDiscount,
    } = req.body;
    product.productName = productName;
    product.productSKU = productSKU;
    product.productMinimumQuantity = productMinimumQuantity;
    product.productMinimumPrice = productMinimumPrice;
    product.productDiscount = productDiscount;

    await product.save();
    res.status(200).json({ message: "Product updated" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});
