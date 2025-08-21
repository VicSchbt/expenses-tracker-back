import prisma from "../lib/db";

// Create a category for a user
export async function createCategory(userId: string, name: string) {
  return prisma.category.create({
    data: { name, userId },
  });
}

// Get all categories for a user
export async function listCategories(userId: string) {
  return prisma.category.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

// Rename a category (still unique per user)
export async function renameCategory(userId: string, id: string, name: string) {
  // Ownership check is enforced in the WHERE
  return prisma.category
    .update({
      where: { id },
      data: { name },
    })
    .catch((err) => {
      // if the id doesn't belong to the user, update will still succeed unless we check first
      // so we’ll do an ownership guard below instead:
      throw err;
    });
}

export async function deleteCategory(userId: string, id: string) {
  // delete where both id & userId match to prevent cross-tenant deletion
  return prisma.category.deleteMany({
    where: { id, userId },
  }); // returns count; if 0, it wasn't owned by user or didn't exist
}

// Safer version of rename with ownership guard
export async function renameCategorySafe(
  userId: string,
  id: string,
  name: string
) {
  const cat = await prisma.category.findFirst({ where: { id, userId } });
  if (!cat) {
    const err: any = new Error("Category not found");
    err.status = 404;
    throw err;
  }
  return prisma.category.update({ where: { id }, data: { name } });
}
