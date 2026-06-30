// controllers/validationController.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const updateTicketStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'APPROVED' o 'REJECTED'

    try {
        // Usamos una transacción para asegurar consistencia
        const result = await prisma.$transaction(async (tx) => {
            const ticket = await tx.validationTicket.update({
                where: { id: parseInt(id) },
                data: { status }
            });

            if (status === 'APPROVED') {
                await tx.parkingLot.update({
                    where: { id: ticket.parkingLotId },
                    data: { active: true } // El parqueadero ya puede operar
                });
            }
            return ticket;
        });
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: "Error al procesar la validación" });
    }
};