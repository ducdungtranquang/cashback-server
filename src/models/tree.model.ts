import mongoose, { Schema } from "mongoose";

export interface ITree {
  type: "Sunflower" | "Cactus" | "Lotus" | "Mushroom";
  plantedAt: Date;
  lastWateredAt: Date;
  waterings: number;
  status: "alive" | "dead" | "finish";
}

export const TreeSchema = new Schema<ITree>({
  type: { type: String, required: true },
  plantedAt: { type: Date, default: Date.now },
  lastWateredAt: { type: Date, default: Date.now },
  waterings: { type: Number, default: 0 },
  status: { type: String, default: "alive" },
});

export default mongoose.model<ITree>("Tree", TreeSchema);
