import { Request, Response } from "express";
import { shopService } from "../services/shop.service";

export const getAllShops = async (req: Request, res: Response) => {
  try {
    const { 
      page = "1", 
      limit = "20", 
      category, 
      platform, 
      active 
    } = req.query;
    
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    
    const filters: any = {};
    if (category) filters.category = category;
    if (platform) filters.platform = platform;
    if (active !== undefined) filters.active = active === "true";
    
    const result = await shopService.getAllShops(pageNum, limitNum, filters);
    
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error("Error getting shops:", error);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
};

export const getShopById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const shop = await shopService.getShopById(id);
    
    if (!shop) {
      return res.status(404).json({
        success: false,
        error: "Shop not found"
      });
    }
    
    res.status(200).json({
      success: true,
      data: shop
    });
  } catch (error) {
    console.error("Error getting shop:", error);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
};

export const createShop = async (req: Request, res: Response) => {
  try {
    // Check if user has admin rights
    if ((req.user as any)?.role !== 1) {
      return res.status(403).json({
        success: false,
        error: "Permission denied"
      });
    }
    
    const shop = await shopService.createShop(req.body);
    
    res.status(201).json({
      success: true,
      data: shop
    });
  } catch (error) {
    console.error("Error creating shop:", error);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
};

export const updateShop = async (req: Request, res: Response) => {
  try {
    // Check if user has admin rights
    if ((req.user as any)?.role !== 1) {
      return res.status(403).json({
        success: false,
        error: "Permission denied"
      });
    }
    
    const { id } = req.params;
    const shop = await shopService.updateShop(id, req.body);
    
    if (!shop) {
      return res.status(404).json({
        success: false,
        error: "Shop not found"
      });
    }
    
    res.status(200).json({
      success: true,
      data: shop
    });
  } catch (error) {
    console.error("Error updating shop:", error);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
};

export const deleteShop = async (req: Request, res: Response) => {
  try {
    // Check if user has admin rights
    if ((req.user as any)?.role !== 1) {
      return res.status(403).json({
        success: false,
        error: "Permission denied"
      });
    }
    
    const { id } = req.params;
    const shop = await shopService.deleteShop(id);
    
    if (!shop) {
      return res.status(404).json({
        success: false,
        error: "Shop not found"
      });
    }
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error: any) {
    console.error("Error deleting shop:", error);
    
    // Check for specific error about associated products
    if (error.message && error.message.includes("associated products")) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
};

export const getShopCategories = async (req: Request, res: Response) => {
  try {
    const categories = await shopService.getShopCategories();
    
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error("Error getting shop categories:", error);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
};

export const getShopPlatforms = async (req: Request, res: Response) => {
  try {
    const platforms = await shopService.getShopPlatforms();
    
    res.status(200).json({
      success: true,
      data: platforms
    });
  } catch (error) {
    console.error("Error getting shop platforms:", error);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
};

export const reindexAllShops = async (req: Request, res: Response) => {
  try {
    // Check if user has admin rights
    if ((req.user as any)?.role !== 1) {
      return res.status(403).json({
        success: false,
        error: "Permission denied"
      });
    }
    
    const result = await shopService.reindexAllShops();
    
    res.status(200).json({
      success: true,
      message: `Reindexed ${result.count} shops`
    });
  } catch (error) {
    console.error("Error reindexing shops:", error);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
};