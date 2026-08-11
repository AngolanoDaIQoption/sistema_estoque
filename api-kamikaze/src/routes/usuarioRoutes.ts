import { Router } from 'express';
import { UsuarioController } from '../controllers/UsuarioController';

const UserRouter = Router();

// Mapeando a requisição POST (Envio de dados) para a função do Controller
UserRouter.post('/cadastrar', UsuarioController.cadastrar);
UserRouter.post('/login', UsuarioController.login);

export default UserRouter;