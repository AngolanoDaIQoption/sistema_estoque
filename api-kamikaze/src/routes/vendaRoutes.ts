import { Router } from 'express';
import { VendaController } from '../controllers/VendaController';
import  authMiddleware, { restrigirParaADM } from '../middlewares/authMiddleware';

const router = Router();

// Rotas liberadas para qualquer usuario autenticado
router.post('/', authMiddleware, VendaController.registrar);
router.get('/', authMiddleware, VendaController.listar);

// Rotas restritas para Administradores (Editar e Deletar)
router.put('/:id', authMiddleware, restrigirParaADM, VendaController.atualizar);
router.delete('/:id', authMiddleware, restrigirParaADM, VendaController.excluir);

export default router;