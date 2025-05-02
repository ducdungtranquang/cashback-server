import mongoose, { Document, Schema } from "mongoose";
import { elasticsearchService } from "../services/elasticsearch.service";

export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  price: number;
  cashbackPercentage: number;
  categories: string[];
  shopId: mongoose.Types.ObjectId;
  shopName: string;
  platform: string;
  images: string[];
  url: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    cashbackPercentage: { type: Number, required: true },
    categories: [{ type: String, required: true }],
    shopId: { type: Schema.Types.ObjectId, ref: "Shop", required: true },
    shopName: { type: String, required: true },
    platform: { type: String, required: true },
    images: [{ type: String }],
    url: { type: String, required: true },
    active: { type: Boolean, default: true }
  },
  {
    timestamps: true
  }
);

// Index product in Elasticsearch after save
ProductSchema.post("save", async function(doc:any) {
  try {
    await elasticsearchService.indexProduct(doc);
  } catch (error) {
    console.error("Error indexing product:", error);
  }
});

// Update product in Elasticsearch after update
ProductSchema.post("findOneAndUpdate", async function(doc) {
  if (doc) {
    try {
      await elasticsearchService.indexProduct(doc);
    } catch (error) {
      console.error("Error updating product in Elasticsearch:", error);
    }
  }
});

// Remove product from Elasticsearch after delete
ProductSchema.post("findOneAndDelete", async function(doc) {
  if (doc) {
    try {
      await elasticsearchService.deleteProduct(doc._id.toString());
    } catch (error) {
      console.error("Error removing product from Elasticsearch:", error);
    }
  }
});

export default mongoose.model<IProduct>("Product", ProductSchema);