import { Request, Response } from "express";
import { productService } from "../services/product.service";

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { 
      page = "1", 
      limit = "20", 
      category, 
      shop, 
      platform, 
      active 
    } = req.query;
    
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    
    const filters: any = {};
    if (category) filters.category = category;
    if (shop) filters.shopId = shop;
    if (platform) filters.platform = platform;
    if (active !== undefined) filters.active = active === "true";
    
    const result = await productService.getAllProducts(pageNum, limitNum, filters);
    
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error("Error getting products:", error);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found"
      });
    }
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error("Error getting product:", error);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    // Check if user has admin rights
    if ((req.user as any)?.role !== 1) {
      return res.status(403).json({
        success: false,
        error: "Permission denied"
      });
    }
    
    const product = await productService.createProduct(req.body);
    
    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error: any) {
    console.error("Error creating product:", error);
    res.status(error.message.includes("Shop not found") ? 400 : 500).json({
      success: false,
      error: error.message || "Server error"
    });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    // Check if user has admin rights
    if ((req.user as any)?.role !== 1) {
      return res.status(403).json({
        success: false,
        error: "Permission denied"
      });
    }
    
    const { id } = req.params;
    const product = await productService.updateProduct(id, req.body);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found"
      });
    }
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error: any) {
    console.error("Error updating product:", error);
    res.status(error.message.includes("Shop not found") ? 400 : 500).json({
      success: false,
      error: error.message || "Server error"
    });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    // Check if user has admin rights
    if ((req.user as any)?.role !== 1) {
      return res.status(403).json({
        success: false,
        error: "Permission denied"
      });
    }
    
    const { id } = req.params;
    const product = await productService.deleteProduct(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found"
      });
    }
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
};

export const reindexAllProducts = async (req: Request, res: Response) => {
  try {
    // Check if user has admin rights
    if ((req.user as any)?.role !== 1) {
      return res.status(403).json({
        success: false,
        error: "Permission denied"
      });
    }
    
    const result = await productService.reindexAllProducts();
    
    res.status(200).json({
      success: true,
      message: `Reindexed ${result.count} products`
    });
  } catch (error) {
    console.error("Error reindexing products:", error);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
};