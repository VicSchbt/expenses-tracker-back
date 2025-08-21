// src/controllers/category.controller.ts
import { Request, Response } from "express";
import {
  createCategory,
  listCategories,
  renameCategorySafe,
  deleteCategory,
} from "../../services/category.service";
import {
  createCategorySchema,
  renameCategorySchema,
} from "../../validators/category.schema";

export async function getCategories(req: Request, res: Response) {
  const userId = (req as any).user?.id as string;
  const data = await listCategories(userId);
  res.json(data);
}

export async function postCategory(req: Request, res: Response) {
  const userId = (req as any).user?.id as string;
  const parsed = createCategorySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten() });
  }

  try {
    const created = await createCategory(userId, parsed.data.name);
    res.status(201).json(created);
  } catch (err: any) {
    // prisma unique constraint
    if (err.code === "P2002") {
      return res
        .status(409)
        .json({ message: "You already have a category with this name." });
    }
    throw err;
  }
}

export async function patchCategory(req: Request, res: Response) {
  const userId = (req as any).user?.id as string;
  const { id } = req.params;
  const parsed = renameCategorySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten() });
  }

  try {
    const updated = await renameCategorySafe(userId, id, parsed.data.name);
    res.json(updated);
  } catch (err: any) {
    if (err.status === 404)
      return res.status(404).json({ message: "Category not found." });
    if (err.code === "P2002")
      return res
        .status(409)
        .json({ message: "You already have a category with this name." });
    throw err;
  }
}

export async function removeCategory(req: Request, res: Response) {
  const userId = (req as any).user?.id as string;
  const { id } = req.params;

  const result = await deleteCategory(userId, id);
  if (result.count === 0)
    return res.status(404).json({ message: "Category not found." });

  // All linked expenses now have categoryId = null (thanks to onDelete: SetNull at the relation)
  res.status(204).send();
}
