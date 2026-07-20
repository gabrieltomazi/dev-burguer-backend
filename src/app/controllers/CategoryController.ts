import type { Request, Response } from "express";
import { z } from 'zod';
import { prisma } from "../../database/prisma";

const CategoryController = {
  async store(req: Request, res: Response) {
    const schema = z.object({
      name: z.string().min(1, "O nome é obrigatório"),
    });

    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ errors: result.error.issues });
    }

    if (!req.file) {
      return res.status(400).json({ error: "A imagem da categoria é obrigatória!" });
    }

    const { name } = req.body;
    const { filename: path } = req.file;

    try {
      const categoryExists = await prisma.category.findUnique({ where: { name } });

      if (categoryExists) {
        return res.status(400).json({ error: "Essa categoria já existe!" });
      }

      const newCategory = await prisma.category.create({
        data: { name, path },
      });

      const categoryWithUrl = {
        ...newCategory,
        url: `http://localhost:3000/category-file/${newCategory.path}`,
      };

      return res.status(201).json(categoryWithUrl);
    } catch (dbError) {
      console.error("Erro no Banco de Dados:", dbError);
      return res.status(500).json({ error: "Erro ao salvar no banco." });
    }
  },

  async update(req: Request, res: Response) {
    const schema = z.object({
      name: z.string().optional(),
    });

    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ errors: result.error.issues });
    }

    const id = Number(req.params.id);

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      return res.status(404).json({ error: "Categoria não encontrada" });
    }

    const { name } = req.body;

    let path = category.path;
    if (req.file) {
      path = req.file.filename;
    }

    if (name && name !== category.name) {
      const categoryNameExists = await prisma.category.findUnique({ where: { name } });
      if (categoryNameExists) {
        return res.status(400).json({ error: "Já existe uma categoria com esse nome" });
      }
    }

    try {
      const updatedCategory = await prisma.category.update({
        where: { id },
        data: {
          name: name || category.name,
          path,
        },
      });

      return res.status(200).json({
        message: "Categoria atualizada!",
        category: {
          ...updatedCategory,
          url: `http://localhost:3000/category-file/${updatedCategory.path}`,
        },
      });
    } catch (dbError) {
      console.error("Erro ao atualizar no banco:", dbError);
      return res.status(500).json({ error: "Erro interno ao atualizar." });
    }
  },

  async list(_req: Request, res: Response) {
    try {
      const categories = await prisma.category.findMany();
      const categoriesWithUrl = categories.map((cat) => ({
        ...cat,
        url: `http://localhost:3000/category-file/${cat.path}`,
      }));
      return res.status(200).json(categoriesWithUrl);
    } catch {
      return res.status(500).json({ error: "Erro ao buscar categorias." });
    }
  }
};

export default CategoryController;