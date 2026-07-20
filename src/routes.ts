import { Router } from 'express';

import CategoryController from './app/controllers/CategoryController.js';
import OrderController from './app/controllers/OrderController.js';
import ProductController from './app/controllers/ProductController.js';
import SessionController from './app/controllers/SessionController.js';
import UserController from './app/controllers/UserController.js';

import multer from 'multer';
import adminMiddleware from './app/middlewares/admin.js';
import authMiddleware from './app/middlewares/auth.js';
import multerConfig from './config/multer.js';

const routes = Router();
const upload = multer(multerConfig);

// --- 1. ROTAS PÚBLICAS (Ninguém precisa de token) ---
routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

// Permitir que o Front-end liste produtos e categorias sem estar logado
routes.get('/products', ProductController.list);
routes.get('/categories', CategoryController.list);

// --- 2. MIDDLEWARE DE AUTENTICAÇÃO ---
// Tudo abaixo desta linha EXIGE que o usuário esteja logado
routes.use(authMiddleware);

// --- 3. ROTAS DE USUÁRIO AUTENTICADO ---
routes.get('/orders', OrderController.list);
routes.post('/orders', OrderController.store);

// --- 4. ROTAS ADMINISTRATIVAS (Exigem adminMiddleware) ---
routes.post(
	'/products',
	adminMiddleware,
	upload.single('file'),
	ProductController.store,
);
routes.put(
	'/products/:id',
	adminMiddleware,
	upload.single('file'),
	ProductController.update,
);

routes.post(
	'/categories',
	adminMiddleware,
	upload.single('file'),
	CategoryController.store,
);
routes.put(
	'/categories/:id',
	adminMiddleware,
	upload.single('file'),
	CategoryController.update,
);

routes.put('/orders/:id', adminMiddleware, OrderController.update);

export default routes;
