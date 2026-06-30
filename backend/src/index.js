// --- 1. IMPORTACIONES ---
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import dotenv from 'dotenv';

// Importaciones locales
import './passport-setup.js'; // Asegúrate de que el archivo exista
import authRoutes from './routes/auth.js'; 
import { startCronJobs } from './jobs/reservation.jobs.js';
// Nota: Si usas Prisma, aquí no necesitas el pool de pg, 
// a menos que tengas lógica específica con él.

// --- 2. CONFIGURACIÓN ---
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8081;

// --- 3. MIDDLEWARES ---
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'secret-key',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// --- 4. RUTAS ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend de LOCIFY conectado' });
});

app.use('/api/auth', authRoutes);
// Aquí podrías agregar app.use('/api/reservations', reservationRoutes);

// --- 5. INICIALIZACIÓN ---
// Iniciar procesos en segundo plano
startCronJobs();

app.listen(PORT, () => {
  console.log(`🚀 Servidor LOCIFY corriendo en http://localhost:${PORT}`);
});