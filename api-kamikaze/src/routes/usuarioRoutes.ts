import { Router } from 'express';
import { UsuarioController } from '../controllers/UsuarioController';
import  authMiddleware  from '../middlewares/authMiddleware';
import {  restrigirParaADM } from '../middlewares/authMiddleware';

const router = Router();

router.post('/login', UsuarioController.login);

router.get('/', authMiddleware, UsuarioController.listar);
router.post('/', authMiddleware, restrigirParaADM, UsuarioController.cadastrar);
router.put('/:id', authMiddleware, UsuarioController.atualizar);
router.delete('/:id', authMiddleware, restrigirParaADM, UsuarioController.excluir);

export default router;