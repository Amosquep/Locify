import { Router } from 'express';
import { createReservation, processCheckIn } from '../controllers/reservation.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Ruta protegida: Solo usuarios logueados pueden reservar
router.post('/', verifyToken, createReservation);

// Ruta protegida: Solo usuarios logueados pueden hacer check-in
router.post('/check-in', verifyToken, processCheckIn);

export default router;