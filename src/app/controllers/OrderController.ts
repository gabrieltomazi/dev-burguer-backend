import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../../database/prisma";


export const OrderController = {
  async list(_req: Request, res: Response) {
    try {
      const orders = await prisma.order.findMany({
        include: {
          user: {
            select: { id: true, name: true }
          },
          items: {
            include: {
              product: {
                include: {
                  category: {
                    select: { name: true }
                  }
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      const formattedOrders = orders.map((order) => ({
        _id: order.id,
        user: {
          id: order.user.id,
          name: order.user.name,
        },
        products: order.items.map((item) => ({
          id: item.product.id,
          name: item.product.name,
          price: item.price,
          category: item.product.category?.name || "",
          quantity: item.quantity,
          url: `http://localhost:3000/product-file/${item.product.path}`,
        })),
        status: order.status,
        createdAt: order.createdAt,
      }));

      return res.status(200).json(formattedOrders);
    } catch (error) {
      console.error("Erro ao listar pedidos:", error);
      return res.status(500).json({ error: "Erro ao buscar pedidos." });
    }
  },

  async store(req: Request, res: Response) {
    const schema = z.object({
      products: z.array(
        z.object({
          id: z.number(),
          quantity: z.number(),
        })
      ),
    });

    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ errors: result.error.issues });
    }

    const { userId } = req as Request & { userId?: string };

    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const { products } = result.data;

    const productIds = products.map((product) => product.id);

    try {
      const dbProducts = await prisma.product.findMany({
        where: {
          id: { in: productIds }
        }
      });

      const newOrder = await prisma.order.create({
        data: {
          userId,
          status: "Pedido realizado",
          items: {
            create: dbProducts.map((p) => {
              const productInReq = products.find((item) => item.id === p.id);
              const quantity = productInReq ? productInReq.quantity : 1;
              return {
                productId: p.id,
                quantity,
                price: p.price,
              };
            })
          }
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: { select: { name: true } }
                }
              }
            }
          }
        }
      });

      return res.status(201).json(newOrder);
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      return res.status(500).json({ error: "Erro ao registrar o pedido." });
    }
  },

  async update(req: Request, res: Response) {
    const schema = z.object({
      status: z.string(),
    });

    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ errors: result.error.issues });
    }

    const { status } = req.body;
    const { id } = req.params as { id: string };

    try {
      const updatedOrder = await prisma.order.update({
        where: { id },
        data: { status },
      });

      return res.status(200).json({ message: "Status atualizado com sucesso", order: updatedOrder });
    } catch {
      return res.status(400).json({ error: "Pedido não encontrado ou falha na atualização." });
    }
  }
};

export default OrderController;