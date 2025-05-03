// syncShops.ts
import mongoose from "mongoose";
import { Client } from "elasticsearch";
import { normalizeVietnamese } from "../ultils/vietnamese-utils";

async function sync() {
  await mongoose.connect("mongodb://mongo:27017/cashback");

  const Shop = mongoose.model(
    "Shop",
    new mongoose.Schema({}, { strict: false }) // Chấp nhận mọi field từ DB
  );

  const esClient = new Client({ host: "http://elasticsearch:9200" });

  const shops = await Shop.find({}).lean();

  const body = shops.flatMap((doc: any) => {
    const normalizedName = normalizeVietnamese(doc.name);
    const normalizedDescription = normalizeVietnamese(doc.description || "");

    return [
      { index: { _index: "shops", _id: doc._id.toString() } },
      {
        name: doc.name,
        normalizedName,
        description: doc.description,
        normalizedDescription,
        categories: doc.categories,
        platform: doc.platform,
        logo: doc.logo,
        url: doc.url,
        averageCashback: doc.averageCashback,
        active: doc.active,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      },
    ];
  });

  const result = await esClient.bulk({ refresh: true, body });

  if (result.errors) {
    console.error("❌ Lỗi khi đẩy dữ liệu:", result.errors);
  } else {
    console.log(`✅ Đã đẩy ${shops.length} shop lên Elasticsearch`);
  }

  process.exit(0);
}

sync().catch(console.error);
