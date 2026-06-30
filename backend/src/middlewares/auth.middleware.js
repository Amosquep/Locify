import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  // 1. Obtener el token del encabezado Authorization
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(403).json({ message: 'Acceso denegado. No se proporcionó token.' });
  }

  // El token suele venir como "Bearer <token>"
  const token = authHeader.split(' ')[1];

  try {
    // 2. Verificar la firma del token con nuestra clave secreta
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // Guardamos la info del usuario en la petición
    next(); // ¡Todo bien! Pasamos al siguiente paso (controlador)
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado.' });
  }
};