import type { Request, Response } from "express";
import { z } from 'zod'
import { prisma } from '../../database/prisma';


const ProductController = {
	async store(req: Request, res: Response) {
		const schema = z.object({
			name: z.string(),
			price: z.number(),
			category_id: z.number(),
			offer: z.boolean().optional(),
		});

		const result = schema.safeParse(req.body);

		if (!result.success) {
			return res.status(400).json({ errors: result.error.issues });
		}

		if (!req.file) {
			return res.status(400).json({ error: "A imagem do produto é obrigatória!" });
		}

		const { name, price, category_id, offer } = req.body;
		const { filename: path } = req.file;

		try {
			const newProduct = await prisma.product.create({
				data: {
					name,
					price: Number(price),
					categoryId: Number(category_id),
					path,
					offer: offer === 'true' || offer === true,
				},
				include: {
					category: {
						select: { id: true, name: true }
					}
				}
			});

			return res.status(201).json({
				...newProduct,
				url: `http://localhost:3000/product-file/${newProduct.path}`,
			});
		} catch (dbError) {
			console.error("Erro ao criar produto no banco:", dbError);
			return res.status(500).json({ error: "Erro interno no banco de dados" });
		}
	},

	async update(req: Request, res: Response) {
		const schema = z.object({
			name: z.string().optional(),
			price: z.number().optional(),
			category_id: z.number().optional(),
			offer: z.boolean().optional(),
		});

		const result = schema.safeParse(req.body);

		if (!result.success) {
			return res.status(400).json({ errors: result.error.issues });
		}

		const id = Number(req.params.id);

		try {
			const product = await prisma.product.findUnique({ where: { id } });
			if (!product) {
				return res.status(404).json({ error: "Produto não encontrado!" });
			}

			const { name, price, category_id, offer } = req.body;
			let path = product.path;

			if (req.file) {
				path = req.file.filename;
			}

			const updatedProduct = await prisma.product.update({
				where: { id },
				data: {
					name: name || product.name,
					price: price !== undefined ? Number(price) : product.price,
					categoryId: category_id !== undefined ? Number(category_id) : product.categoryId,
					path,
					offer: offer !== undefined ? (offer === 'true' || offer === true) : product.offer,
				},
			});

			return res.status(200).json({
				message: "Produto atualizado com sucesso!",
				product: {
					...updatedProduct,
					url: `http://localhost:3000/product-file/${updatedProduct.path}`,
				}
			});
		} catch (error) {
			console.error("Erro ao atualizar produto:", error);
			return res.status(500).json({ error: "Erro ao atualizar produto no banco." });
		}
	},

	async list(_req: Request, res: Response) {
		try {
			const products = await prisma.product.findMany({
				include: {
					category: {
						select: { id: true, name: true }
					}
				}
			});

			const productsWithUrl = products.map((product) => ({
				...product,
				url: `http://localhost:3000/product-file/${product.path}`,
			}));

			return res.status(200).json(productsWithUrl);
		} catch (error) {
			console.error("Erro ao listar produtos:", error);
			return res.status(500).json({ error: "Erro ao buscar produtos." });
		}
	}
};

export default ProductController;