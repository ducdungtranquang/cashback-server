import Product, { IProduct } from "../models/product.model";
import Shop from "../models/shop.model";
import { elasticsearchService } from "./elasticsearch.service";
import mongoose from "mongoose";

class ProductService {
  async getAllProducts(page = 1, limit = 20, filters: any = {}) {
    const query: any = {};
    
    if (filters.category) {
      query.categories = filters.category;
    }
    
    if (filters.shopId) {
      query.shopId = new mongoose.Types.ObjectId(filters.shopId);
    }
    
    if (filters.platform) {
      query.platform = filters.platform;
    }
    
    if (filters.active !== undefined) {
      query.active = filters.active;
    } else {
      query.active = true; // Default to active products only
    }
    
    const total = await Product.countDocuments(query);
    
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    return {
      products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }
  
  async getProductById(id: string) {
    return Product.findById(id);
  }
  
  async createProduct(productData: Partial<IProduct>) {
    // Ensure the shop exists and is active
    const shop = await Shop.findById(productData.shopId);
    if (!shop) {
      throw new Error("Shop not found");
    }
    if (!shop.active) {
      throw new Error("Cannot add product to inactive shop");
    }
    
    // Add shop name to product data
    const productWithShopName = {
      ...productData,
      shopName: shop.name
    };
    
    const product = await Product.create(productWithShopName);
    return product;
  }
  
  async updateProduct(id: string, productData: Partial<IProduct>) {
    // If shopId is changing, ensure the new shop exists and update shopName
    if (productData.shopId) {
      const shop = await Shop.findById(productData.shopId);
      if (!shop) {
        throw new Error("Shop not found");
      }
      if (!shop.active) {
        throw new Error("Cannot move product to inactive shop");
      }
      
      // Update shopName to match the new shop
      productData.shopName = shop.name;
    }
    
    const product = await Product.findByIdAndUpdate(
      id,
      productData,
      { new: true, runValidators: true }
    );
    
    return product;
  }
  
  async deleteProduct(id: string) {
    const product = await Product.findByIdAndDelete(id);
    
    if (product) {
      try {
        await elasticsearchService.deleteProduct(id);
      } catch (error) {
        console.error("Error removing product from Elasticsearch:", error);
      }
    }
    
    return product;
  }
  
  async reindexAllProducts() {
    const products = await Product.find();
    await elasticsearchService.reindexAllProducts(products);
    return { success: true, count: products.length };
  }
}

export const productService = new ProductService();