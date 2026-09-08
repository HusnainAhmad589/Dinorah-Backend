import { Request, Response, NextFunction } from "express";
import {
  getCategoriesService,
  getCategoryByIdService,
  createCategoryService,
  updateCategoryService,
  deleteCategoryService,
} from "../services/product.service";
import {
  validateCreateCategory,
  validateUpdateCategory,
} from "../validators/category.validator";
import { AppError } from "../middleware/error.middleware";

export async function getCategoriesController(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const categories = await getCategoriesService();

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    next(error);
  }
}

export async function getCategoryByIdController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Number(req.params.id);
    const category = await getCategoryByIdService(id);

    res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    next(error);
  }
}

export async function createCategoryController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validation = validateCreateCategory(req.body);
    if (!validation.isValid || !validation.data) {
      throw new AppError("Invalid category data", 400, validation.errors);
    }

    const category = await createCategoryService(validation.data);

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateCategoryController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Number(req.params.id);
    const validation = validateUpdateCategory(req.body);
    if (!validation.isValid || !validation.data) {
      throw new AppError("Invalid category update data", 400, validation.errors);
    }

    const category = await updateCategoryService(id, validation.data);

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteCategoryController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Number(req.params.id);
    await deleteCategoryService(id);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}
