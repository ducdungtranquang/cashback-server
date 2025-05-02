import Shop, { IShop } from "../models/shop.model";
import Product from "../models/product.model";
import { elasticsearchService } from "./elasticsearch.service";

class ShopService {
  async getAllShops(page = 1, limit = 20, filters: any = {}) {
    const query: any = {};
    
    if (filters.category) {
      query.categories = filters.category;
    }
    
    if (filters.platform) {
      query.platform = filters.platform;
    }
    
    if (filters.active !== undefined) {
      query.active = filters.active;
    } else {
      query.active = true; // Default to active shops only
    }
    
    const total = await Shop.countDocuments(query);
    
    const shops = await Shop.find(query)
      .sort({ averageCashback: -1, name: 1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    return {
      shops,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }
  
  async getShopById(id: string) {
    return Shop.findById(id);
  }
  
  async createShop(shopData: Partial<IShop>) {
    const shop = await Shop.create(shopData);
    return shop;
  }
  
  async updateShop(id: string, shopData: Partial<IShop>) {
    const shop = await Shop.findByIdAndUpdate(
      id,
      shopData,
      { new: true, runValidators: true }
    );
    
    // If shop name changed, update all products with this shop
    if (shop && shopData.name) {
      await Product.updateMany(
        { shopId: id },
        { shopName: shopData.name }
      );
    }
    
    return shop;
  }
  
  async deleteShop(id: string) {
    // Check if there are products associated with this shop
    const productsCount = await Product.countDocuments({ shopId: id });
    if (productsCount > 0) {
      throw new Error(`Cannot delete shop with ${productsCount} associated products`);
    }
    
    const shop = await Shop.findByIdAndDelete(id);
    
    if (shop) {
      try {
        await elasticsearchService.deleteShop(id);
      } catch (error) {
        console.error("Error removing shop from Elasticsearch:", error);
      }
    }
    
    return shop;
  }
  
  async getShopCategories() {
    return Shop.distinct("categories");
  }
  
  async getShopPlatforms() {
    return Shop.distinct("platform");
  }
  
  async reindexAllShops() {
    const shops = await Shop.find();
    await elasticsearchService.reindexAllShops(shops);
    return { success: true, count: shops.length };
  }
}

export const shopService = new ShopService();