import mongoose, { Document, Schema } from "mongoose";

export interface ISearchHistory extends Document {
  userId: mongoose.Types.ObjectId;
  query: string;
  timestamp: Date;
}

const SearchHistorySchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  query: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

// Create index on userId and timestamp for faster queries
SearchHistorySchema.index({ userId: 1, timestamp: -1 });

export default mongoose.model<ISearchHistory>("SearchHistory", SearchHistorySchema);