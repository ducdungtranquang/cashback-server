import { elasticsearchService } from "./elasticsearch.service";
import SearchHistory from "../models/search-history.model";
import { Types } from "mongoose";

class SearchService {
  async searchProducts(
    query: string,
    userId: string | null = null,
    filters: any = {},
    sort: any = {},
    page = 1,
    limit = 20
  ) {
    // Save search history if userId is provided and query is not empty
    if (userId && query && query.trim()) {
      await this.saveSearchHistory(userId, query);
    }

    // Search products
    return elasticsearchService.searchProducts(
      query,
      filters,
      sort,
      page,
      limit
    );
  }

  async searchShops(
    query: string,
    userId: string | null = null,
    filters: any = {},
    page = 1,
    limit = 20
  ) {
    // Save search history if userId is provided and query is not empty
    if (userId && query && query.trim()) {
      await this.saveSearchHistory(userId, query);
    }

    // Search shops
    return elasticsearchService.searchShops(query, filters, page, limit);
  }

  async getSuggestions(query: string, limit = 10) {
    return elasticsearchService.getSuggestions(query, limit);
  }

  async saveSearchHistory(userId: string, query: string) {
    // Only save non-empty queries
    if (!query.trim()) return;

    try {
      await SearchHistory.create({
        userId: new Types.ObjectId(userId),
        query: query.trim(),
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error saving search history:", error);
    }
  }

  async getSearchHistory(userId: string, limit: number = 10) {
    return SearchHistory.find({ userId: new Types.ObjectId(userId) })
      .sort({ timestamp: -1 })
      .limit(limit)
      .select("query timestamp")
      .lean();
  }

  async clearSearchHistory(userId: string, historyId?: string) {
    if (historyId) {
      // Xoá 1 item cụ thể theo ID và userId để tránh xóa nhầm
      await SearchHistory.deleteOne({
        _id: new Types.ObjectId(historyId),
        userId: new Types.ObjectId(userId),
      });
      return { success: true, message: "Single search history entry deleted" };
    } else {
      // Xoá tất cả
      await SearchHistory.deleteMany({ userId: new Types.ObjectId(userId) });
      return { success: true, message: "All search history cleared" };
    }
  }
}

export const searchService = new SearchService();
