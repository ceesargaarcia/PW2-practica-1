const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { authenticateJWT, isAdmin } = require('../middleware/authenticateJWT');

router.get('/', authenticateJWT, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).populate('createdBy', 'username');
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('createdBy', 'username');
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { name, description, price, category, stock, imageUrl, active } = req.body;
    if (!name || !description || price === undefined || !category)
      return res.status(400).json({ error: 'Faltan campos obligatorios' });

    const product = await Product.create({
      name, description, price, category,
      stock: stock ?? 0,
      active: active ?? true,
      imageUrl: imageUrl || 'https://placehold.co/400x300?text=Producto',
      createdBy: req.user.userId,
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ message: 'Producto eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
