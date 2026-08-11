import { Router } from 'express';
import { VendaController } from '../controllers/VendaController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Rotas protegidas pelo middleware de autenticação
router.post('/', authMiddleware, VendaController.registrar);
router.get('/', authMiddleware, VendaController.listar);

export default router;