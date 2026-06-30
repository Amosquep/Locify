import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

export const startCronJobs = () => {
  // La expresión '* * * * *' significa que se ejecutará CADA MINUTO
  cron.schedule('* * * * *', async () => {
    console.log('⏳ [CRON] Ejecutando validación automática de reservas...');
    const now = new Date();

    try {
      // ------------------------------------------------------------------
      // TAREA 1: Cancelación de Reservas Exprés (Regla de 5 minutos)
      // ------------------------------------------------------------------
      const expiredReservations = await prisma.reservation.updateMany({
        where: {
          type: 'EXPRESS',
          status: 'PENDING',
          expiresAt: { lt: now } // lt: Less Than (Si expiró antes de la hora actual)
        },
        data: {
          status: 'CANCELLED'
        }
      });

      if (expiredReservations.count > 0) {
        console.log(`🚫 [CRON] Se cancelaron ${expiredReservations.count} reservas exprés por caducidad. Cupos liberados.`);
      }

      // ------------------------------------------------------------------
      // TAREA 2: Alerta Preventiva de 15 Minutos (Precisión del Instructor)
      // ------------------------------------------------------------------
      // Calculamos el umbral límite sumando 15 minutos a la hora actual
      const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60000);

      // Buscamos reservas ACTIVAS, que no hayan sido notificadas, y cuyo tiempo finalice en los próximos 15 min.
      const nearExpiryReservations = await prisma.reservation.findMany({
        where: {
          status: 'ACTIVE',
          isWarningSent: false,
          endTime: {
            not: null,
            lte: fifteenMinutesFromNow, // lte: Less Than or Equal To
            gt: now                     // gt: Greater Than
          }
        },
        include: { user: true, park: true }
      });

      for (const res of nearExpiryReservations) {
        // En un entorno de producción, aquí se integra Firebase Cloud Messaging, OneSignal o Twilio (SMS).
        // Por ahora, simulamos el despacho de la notificación Push:
        console.log(`⚠️ [PUSH ALERT] Enviando a ${res.user.email}: Tu tiempo en la sede ${res.park.name} finaliza en menos de 15 minutos. Si te excedes, comenzará a correr un cobro adicional por hora.`);

        // Actualizamos la bandera para que este conductor no reciba spam cada minuto
        await prisma.reservation.update({
          where: { id: res.id },
          data: { isWarningSent: true }
        });
      }

    } catch (error) {
      console.error('❌ [CRON] Error crítico en el ciclo de validación de reservas:', error);
    }
  });
};