const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateJWT, isAdmin } = require('../middleware/authenticateJWT');

// GET /api/users  — admin only
router.get('/', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener usuarios', error: err.message });
  }
});

// GET /api/users/me  — own profile
router.get('/me', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err.message });
  }
});

// PUT /api/users/:id/role  — admin only
router.put('/:id/role', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role))
      return res.status(400).json({ message: 'Rol inválido' });

    const user = await User.findByIdAndUpdate(
      req.params.id, { role }, { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar rol', error: err.message });
  }
});

// DELETE /api/users/:id  — admin only
router.delete('/:id', authenticateJWT, isAdmin, async (req, res) => {
  try {
    if (req.params.id === req.user.userId)
      return res.status(400).json({ message: 'No puedes eliminarte a ti mismo' });

    const user = await User.findByIdAndDelete(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json({ message: 'Usuario eliminado', user });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar usuario', error: err.message });
  }
});

module.exports = router;
