import { Request, Response, NextFunction } from "express";
import {
  getProductsService,
  getProductByIdService,
  createProductService,
  updateProductService,
  deleteProductService,
} from "../services/product.service";
import {
  validateCreateProduct,
  validateUpdateProduct,
} from "../validators/product.validator";
import { AppError } from "../middleware/error.middleware";

export async function getProductsController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { category, search, sort, featured, active, minPrice, maxPrice, page, limit } = req.query;
    const products = await getProductsService({
      category: category as string,
      search: search as string,
      sort: sort as any,
      featuredOnly: featured === "true" || featured === "1",
      activeOnly: active === "false" ? false : true,
      minPrice: minPrice !== undefined ? Number(minPrice) : undefined,
      maxPrice: maxPrice !== undefined ? Number(maxPrice) : undefined,
      page: page !== undefined ? Number(page) : undefined,
      limit: limit !== undefined ? Number(limit) : undefined,
    });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProductByIdController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Number(req.params.id);
    const product = await getProductByIdService(id);

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
}

export async function createProductController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validation = validateCreateProduct(req.body);
    if (!validation.isValid || !validation.data) {
      throw new AppError("Invalid product data", 400, validation.errors);
    }

    const product = await createProductService(validation.data);

    res.status(201).json({
      success: true,
      message: "Jewellery piece created successfully",
      product,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProductController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Number(req.params.id);
    const validation = validateUpdateProduct(req.body);
    if (!validation.isValid || !validation.data) {
      throw new AppError("Invalid product update data", 400, validation.errors);
    }

    const product = await updateProductService(id, validation.data);

    res.status(200).json({
      success: true,
      message: "Jewellery piece updated successfully",
      product,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteProductController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Number(req.params.id);
    await deleteProductService(id);

    res.status(200).json({
      success: true,
      message: "Jewellery piece deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}
