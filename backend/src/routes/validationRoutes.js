import express from 'express';
import { getPendingTickets, updateTicketStatus } from '../controllers/validationController.js';

const router = express.Router();

router.get('/pending', getPendingTickets);
router.patch('/:id', updateTicketStatus);

export default router;