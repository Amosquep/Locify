import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export const createReservation = async (req, res) => {
  try {
    const { parkId, type, startTime, endTime } = req.body;
    const userId = req.user.id; // Obtenido del middleware verifyToken

    // 1. Generar un token QR único e inmutable
    const qrToken = crypto.randomBytes(16).toString('hex');

    // 2. Lógica del Modelo Híbrido
    let expiresAt = null;
    let status = 'PENDING';

    if (type === 'EXPRESS') {
      // Regla: 5 minutos de tolerancia desde el startTime
      const start = new Date(startTime);
      expiresAt = new Date(start.getTime() + 5 * 60000); 
    } else if (type === 'GUARANTEED') {
      status = 'PAID'; // El pago 100% se procesa aquí
    }

    // 3. Crear la reserva en base de datos
    const newReservation = await prisma.reservation.create({
      data: {
        parkId,
        userId,
        type,
        status,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        expiresAt,
        qrToken
      }
    });

    return res.status(201).json({
      message: 'Reserva creada con éxito.',
      reservation: newReservation
    });

  } catch (error) {
    console.error('Error creando reserva:', error);
    return res.status(500).json({ message: 'Error interno al procesar la reserva.' });
  }
};

export const processCheckIn = async (req, res) => {
  try {
    const { qrToken } = req.body;

    // 1. Buscar la reserva con el QR
    const reservation = await prisma.reservation.findUnique({
      where: { qrToken },
      include: { park: true }
    });

    if (!reservation) {
      return res.status(404).json({ message: 'Código QR inválido o no encontrado.' });
    }

    // 2. Validar que la reserva no haya sido usada o cancelada
    if (reservation.status !== 'PENDING' && reservation.status !== 'PAID') {
      return res.status(400).json({ 
        message: `Esta reserva ya no es válida. Estado actual: ${reservation.status}` 
      });
    }

    // 3. Validar caducidad para el Modelo Híbrido (Reserva Exprés)
    const now = new Date();
    if (reservation.type === 'EXPRESS' && reservation.expiresAt) {
      if (now > reservation.expiresAt) {
        // Ejecutar cancelación automática si se pasó de los 5 minutos
        await prisma.reservation.update({
          where: { id: reservation.id },
          data: { status: 'CANCELLED' }
        });
        
        return res.status(403).json({ 
          message: 'Tu reserva exprés ha caducado por superar los 5 minutos de tolerancia. El cupo ha sido liberado.' 
        });
      }
    }

    // 4. LÓGICA DE PRECISIÓN: Asignación dinámica de celda
    // Obtenemos todas las reservas activas en este parqueadero para saber qué celdas están ocupadas
    const activeReservations = await prisma.reservation.findMany({
      where: {
        parkId: reservation.parkId,
        status: 'ACTIVE',
        assignedCell: { not: null }
      },
      select: { assignedCell: true }
    });

    const occupiedCells = activeReservations.map(res => res.assignedCell);
    const totalCells = reservation.park.totalCells;
    let assignedCellNumber = null;

    // Buscamos la primera celda libre (del 1 al total de celdas del parqueadero)
    for (let i = 1; i <= totalCells; i++) {
      const cellName = `Celda-${i}`;
      if (!occupiedCells.includes(cellName)) {
        assignedCellNumber = cellName;
        break;
      }
    }

// Contingencia: ¿Qué pasa si físicamente no hay celdas libres? (Overstay del cliente anterior)
    if (!assignedCellNumber) {
      console.log('Alerta de Overstay detectada. Iniciando algoritmo de redirección...');

      // 1. Obtener todos los demás parqueaderos activos
      const otherParks = await prisma.park.findMany({
        where: { 
          id: { not: reservation.parkId },
          kybStatus: 'APPROVED' // Solo parqueaderos legales y verificados
        }
      });

      let nearestPark = null;
      let shortestDistance = Infinity;

      // 2. Evaluar distancia y disponibilidad de cada parqueadero alternativo
      for (const altPark of otherParks) {
        // Calcular distancia desde el parqueadero lleno hasta la alternativa
        const distance = calculateDistance(
          reservation.park.latitude, reservation.park.longitude,
          altPark.latitude, altPark.longitude
        );

        // Si está a menos de 5 km, verificamos si tiene cupo real
        if (distance < 5.0 && distance < shortestDistance) {
          const altActiveReservations = await prisma.reservation.count({
            where: { parkId: altPark.id, status: 'ACTIVE' }
          });

          // Si tiene celdas disponibles, se convierte en nuestro mejor candidato
          if (altActiveReservations < altPark.totalCells) {
            shortestDistance = distance;
            nearestPark = altPark;
          }
        }
      }

      // 3. Resultado del Algoritmo
      if (nearestPark) {
        // Actualizamos la reserva para guardar el rastro de a dónde lo mandamos
        await prisma.reservation.update({
          where: { id: reservation.id },
          data: { redirectedToId: nearestPark.id }
        });

        return res.status(409).json({
          contingency: true,
          message: 'Atención: Un vehículo excedió su tiempo y tu celda original no está disponible.',
          redirection: {
            suggestedPark: nearestPark.name,
            address: nearestPark.address,
            distance: `${shortestDistance.toFixed(2)} km`,
            tariff: `$${nearestPark.pricePerHour} COP/hora`,
            action: '¿Deseas redirigir tu reserva sin costo extra a esta sede?'
          }
        });
      } else {
        // Si definitivamente la ciudad está colapsada y no hay NADA a menos de 5km
        return res.status(409).json({
          contingency: true,
          message: 'Lo sentimos gravemente. Tu parqueadero está lleno por un sobretiempo y no hay alternativas a menos de 5km. Te hemos reembolsado el 100% en créditos.'
        });
      }
    }
    // 5. Consolidar el Check-in y asignar la celda
    const updatedReservation = await prisma.reservation.update({
      where: { id: reservation.id },
      data: {
        status: 'ACTIVE',
        assignedCell: assignedCellNumber
      }
    });

    // 6. Respuesta exitosa al conductor
    return res.status(200).json({
      message: 'Check-in exitoso. Bienvenido a LOCIFY.',
      assignedCell: updatedReservation.assignedCell,
      parkName: reservation.park.name
    });

  } catch (error) {
    console.error('Error en Check-in:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};