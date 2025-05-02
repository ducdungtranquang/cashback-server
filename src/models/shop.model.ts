import mongoose, { Document, Schema } from "mongoose";
import { elasticsearchService } from "../services/elasticsearch.service";

export interface IShop extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  categories: string[];
  platform: string;
  logo: string;
  url: string;
  averageCashback: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ShopSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    categories: [{ type: String, required: true }],
    platform: { type: String, required: true },
    logo: { type: String },
    url: { type: String, required: true },
    averageCashback: { type: Number, default: 0 },
    active: { type: Boolean, default: true }
  },
  {
    timestamps: true
  }
);

// Index shop in Elasticsearch after save
ShopSchema.post("save", async function(doc:any) {
  try {
    await elasticsearchService.indexShop(doc);
  } catch (error) {
    console.error("Error indexing shop:", error);
  }
});

// Update shop in Elasticsearch after update
ShopSchema.post("findOneAndUpdate", async function(doc) {
  if (doc) {
    try {
      await elasticsearchService.indexShop(doc);
    } catch (error) {
      console.error("Error updating shop in Elasticsearch:", error);
    }
  }
});

// Remove shop from Elasticsearch after delete
ShopSchema.post("findOneAndDelete", async function(doc) {
  if (doc) {
    try {
      await elasticsearchService.deleteShop(doc._id.toString());
    } catch (error) {
      console.error("Error removing shop from Elasticsearch:", error);
    }
  }
});

export default mongoose.model<IShop>("Shop", ShopSchema);