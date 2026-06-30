const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../db');

router.post('/register', async (req, res) => {
    const { email, full_name, password } = req.body;

    try {
        // 1. Cifrar la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 2. Guardar en BD
        const query = 'INSERT INTO users (email, full_name, password) VALUES ($1, $2, $3) RETURNING id, email';
        const values = [email, full_name, hashedPassword];
        
        const result = await pool.query(query, values);
        
        res.status(201).json({ message: 'Usuario registrado con éxito', user: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al registrar usuario' });
    }
});

module.exports = router;