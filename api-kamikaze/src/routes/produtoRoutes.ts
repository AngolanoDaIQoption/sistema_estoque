import { Router } from 'express';
import { ProdutoController } from '../controllers/ProdutoController';
import  authMiddleware, { restrigirParaADM } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authMiddleware, ProdutoController.listar);

// Apenas ADM pode cadastrar, editar e excluir produtos
router.post('/', authMiddleware, restrigirParaADM, ProdutoController.cadastrar);
router.put('/:id', authMiddleware, restrigirParaADM, ProdutoController.atualizar);
router.delete('/:id', authMiddleware, restrigirParaADM, ProdutoController.deletar);

export default router;