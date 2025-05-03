// syncMongoToES.ts
import mongoose from "mongoose";
import { Client } from "elasticsearch";
import { normalizeVietnamese } from "../ultils/vietnamese-utils";

async function sync() {
  await mongoose.connect("mongodb://mongo:27017/cashback");
  const Product = mongoose.model(
    "Product",
    new mongoose.Schema({}, { strict: false })
  );

  const esClient = new Client({ host: "http://elasticsearch:9200" });

  const products = await Product.find({}).lean();

  const body = products.flatMap((doc: any) => {
    const normalizedName = normalizeVietnamese(doc.name);
    const normalizedDescription = normalizeVietnamese(doc.description);
    return [
      { index: { _index: "products", _id: doc._id.toString() } },
      {
        name: doc.name,
        normalizedName,
        description: doc.description,
        normalizedDescription,
        price: doc.price,
        cashbackPercentage: doc.cashbackPercentage,
        categories: doc.categories,
        shopId: doc.shopId?.toString?.(),
        shopName: doc.shopName,
        platform: doc.platform,
        url: doc.url,
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
    console.log(`✅ Đã đẩy ${products.length} sản phẩm lên Elasticsearch`);
  }

  process.exit(0);
}

sync().catch(console.error);
