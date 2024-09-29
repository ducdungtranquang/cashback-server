import mongoose from "mongoose";

const BlacklistTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  expirationDate: { type: Date, required: true },
});

const BlacklistToken = mongoose.model("BlacklistToken", BlacklistTokenSchema);

export default BlacklistToken;
