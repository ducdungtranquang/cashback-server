import { Request, Response } from "express";
import { searchService } from "../services/search.service";

export const searchProducts = async (req: Request, res: Response) => {
  try {
    const {
      q,
      category,
      shop,
      platform,
      minPrice,
      maxPrice,
      minCashback,
      maxCashback,
      sortBy,
      sortOrder,
      page = "1",
      limit = "20",
    } = req.query;

    const userId = (req.user as any)._id || null;

    // Prepare filters
    const filters: any = {};
    if (category) filters.category = category;
    if (shop) filters.shopId = shop;
    if (platform) filters.platform = platform;
    if (minPrice) filters.minPrice = parseFloat(minPrice as string);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice as string);
    if (minCashback) filters.minCashback = parseFloat(minCashback as string);
    if (maxCashback) filters.maxCashback = parseFloat(maxCashback as string);

    // Prepare sort
    const sort: any = {};
    if (sortBy === "price") {
      sort.price = sortOrder || "asc";
    } else if (sortBy === "cashback") {
      sort.cashback = sortOrder || "desc";
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const result = await searchService.searchProducts(
      q as string,
      userId,
      filters,
      sort,
      pageNum,
      limitNum
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Error searching products:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

export const searchShops = async (req: Request, res: Response) => {
  try {
    const { q, category, platform, page = "1", limit = "20" } = req.query;

    const userId = (req.user as any)._id || null;

    // Prepare filters
    const filters: any = {};
    if (category) filters.category = category;
    if (platform) filters.platform = platform;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const result = await searchService.searchShops(
      q as string,
      userId,
      filters,
      pageNum,
      limitNum
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Error searching shops:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

export const getSuggestions = async (req: Request, res: Response) => {
  try {
    const { q, limit = "10" } = req.query;

    if (!q) {
      return res.status(200).json({
        success: true,
        products: [],
        shops: [],
      });
    }

    const limitNum = parseInt(limit as string, 10);
    const suggestions = await searchService.getSuggestions(
      q as string,
      limitNum
    );

    res.status(200).json({
      success: true,
      ...suggestions,
    });
  } catch (error) {
    console.error("Error getting suggestions:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

export const getSearchHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)._id;
    const { limit = "10" } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const limitNum = parseInt(limit as string, 10);
    const history = await searchService.getSearchHistory(userId, limitNum);

    res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    console.error("Error getting search history:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

export const clearSearchHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const result = await searchService.clearSearchHistory(userId);

    res.status(200).json({
      success: true,
      message: "Search history cleared",
    });
  } catch (error) {
    console.error("Error clearing search history:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};
