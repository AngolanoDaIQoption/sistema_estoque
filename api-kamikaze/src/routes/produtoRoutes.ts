import { Router } from 'express';
import { ProdutoController } from '../controllers/ProdutoController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Rota pública para listar produtos
router.get('/', ProdutoController.listar);

// Rotas para cadastrar, atualizar e deletar
router.post('/', authMiddleware, ProdutoController.cadastrar); 
router.put('/:id', authMiddleware, ProdutoController.atualizar); 
router.delete('/:id', authMiddleware, ProdutoController.deletar); 

export default router;