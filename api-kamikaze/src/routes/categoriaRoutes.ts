import { Router } from 'express';
import { CategoriaController } from '../controllers/CategoriaController';

const router = Router();

// Importe o seu middleware de verificação de token se já tiver, ou use sem por enquanto:
router.get('/', CategoriaController.listar);
router.post('/', CategoriaController.cadastrar); // Usando 'cadastrar' em vez de 'criar'
router.put('/:id', CategoriaController.atualizar);
export default router;