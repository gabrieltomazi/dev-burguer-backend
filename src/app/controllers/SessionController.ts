import bcrypt from 'bcrypt';
import type { Request, Response } from "express";
import jwt from 'jsonwebtoken';
import { z } from 'zod'
import authConfig from '../../config/auth.js';
import { prisma } from "../../database/prisma";

const SessionController = {
	async store(req: Request, res: Response) {
		const schema = z.object({
			email: z.email(),
			password: z.string().min(6, "A senha precisa conter mais de 5 caracteres"),
		});

		const result = schema.safeParse(req.body);

		function emailOrPasswordIncorrect() {
			return res.status(400).json({ error: 'E-mail ou senha incorreto' });
		};

		if (!result.success) {
			return emailOrPasswordIncorrect();
		}

		const { email, password } = req.body;

		const existingUser = await prisma.user.findUnique({
			where: { email },
		});

		if (!existingUser) {
			return emailOrPasswordIncorrect();
		}

		const isPasswordCorrect = await bcrypt.compare(
			password,
			existingUser.password_hash,
		);
		if (!isPasswordCorrect) {
			return emailOrPasswordIncorrect();
		}

		const token = jwt.sign({
			id: existingUser.id,
			admin: existingUser.admin,
			name: existingUser.name
		},
			authConfig.secret,
			{
				expiresIn: authConfig.expiresIn,
			},
		);

		return res.status(200).json({
			id: existingUser.id,
			name: existingUser.name,
			email: existingUser.email,
			admin: existingUser.admin,
			token,
		});
	}
};

export default SessionController;
