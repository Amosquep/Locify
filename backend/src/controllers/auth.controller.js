import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Función auxiliar para generar el token
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: '24h', // El token caduca en 1 día
  });
};

// 1. REGISTRO TRADICIONAL
export const register = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'El correo ya está registrado.' });
    }

    // Encriptar la contraseña (hashing)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear el usuario en la base de datos
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || 'CLIENT' // Por defecto es cliente si no se especifica
      }
    });

    // Generar el token de acceso
    const token = generateToken(newUser.id, newUser.role);

    return res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// 2. LOGIN TRADICIONAL
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar al usuario
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    // Comparar la contraseña ingresada con la encriptada en la BD
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    // Generar el token
    const token = generateToken(user.id, user.role);

    return res.status(200).json({
      message: 'Login exitoso',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });

  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// 3. LOGIN CON GOOGLE
export const googleLogin = async (req, res) => {
  try {
    const { email, name } = req.body; // Estos datos vendrán validados desde tu Frontend con Firebase o Google Provider

    // Buscamos si el usuario de Google ya existe en LOCIFY
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Si no existe, lo registramos automáticamente (sin contraseña)
      user = await prisma.user.create({
        data: {
          email,
          name,
          role: 'CLIENT'
        }
      });
    }

    // Generamos su token nativo de nuestro ecosistema
    const token = generateToken(user.id, user.role);

    return res.status(200).json({
      message: 'Login con Google exitoso',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });

  } catch (error) {
    console.error('Error en Google Login:', error);
    return res.status(500).json({ message: 'Error procesando el login con Google.' });
  }
};