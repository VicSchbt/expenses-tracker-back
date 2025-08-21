import { Router } from "express";
import {
  getCategories,
  postCategory,
  patchCategory,
  removeCategory,
} from "../controllers/category/category.controller";
import { basicAuth } from "../middleware/basicAuth"; // <- your JWT/session guard

const router = Router();

router.use(basicAuth); // everything below requires auth
router.get("/", getCategories); // GET /api/categories
router.post("/", postCategory); // POST /api/categories { name }
router.patch("/:id", patchCategory); // PATCH /api/categories/:id { name }
router.delete("/:id", removeCategory); // DELETE /api/categories/:id

export default router;
