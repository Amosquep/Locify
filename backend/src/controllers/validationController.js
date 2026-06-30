import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Obtener todos los tickets de validación pendientes
export const getPendingTickets = async (req, res) => {
    try {
        const tickets = await prisma.validationTicket.findMany({
            where: { status: 'PENDING' }
        });
        res.status(200).json(tickets);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener tickets pendientes" });
    }
};

// Aprobar o rechazar un ticket
export const updateTicketStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // Se espera 'APPROVED' o 'REJECTED'

    try {
        const updatedTicket = await prisma.validationTicket.update({
            where: { id: parseInt(id) },
            data: { status }
        });
        res.status(200).json(updatedTicket);
    } catch (error) {
        res.status(400).json({ error: "No se pudo actualizar el estado del ticket" });
    }
};