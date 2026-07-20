import bcrypt from 'bcrypt';
import type { Request, Response } from "express";
import { z } from 'zod';
import { prisma } from "../../database/prisma";

const UserController = {
	async store(req: Request, res: Response) {
		const schema = z.object({
			name: z.string(),
			email: z.email(),
			password: z.string().min(6),
			admin: z.boolean().optional(),
		});

		const result = schema.safeParse(req.body);

		if (!result.success) {
			return res.status(400).json({ errors: result.error.issues });
		}

		const { name, email, password, admin } = req.body;

		try {
			const existingUser = await prisma.user.findUnique({
				where: { email },
			});

			if (existingUser) {
				return res.status(400).json({ message: 'Este e-mail já está cadastrado!' });
			}

			const password_hash = await bcrypt.hash(password, 10);

			const user = await prisma.user.create({
				data: {
					name,
					email,
					password_hash,
					admin: admin || false,
				},
			});

			return res.status(201).json({
				id: user.id,
				name: user.name,
				email: user.email,
				admin: user.admin,
			});

		} catch (error) {
			console.log(error)
			return res.status(500).json({ error: "Erro interno ao criar usuário" })
		}

	}
};

export default UserController;
