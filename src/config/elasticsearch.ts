import { Client } from "elasticsearch";
import dotenv from "dotenv";

dotenv.config();

const ELASTICSEARCH_URL =
  process.env.ELASTICSEARCH_URL || "http://elasticsearch:9200";

export const elasticsearchClient = new Client({
  host: ELASTICSEARCH_URL,
});

export const setupElasticsearch = async () => {
  try {
    // Check if Elasticsearch is running
    elasticsearchClient.ping(
      { requestTimeout: 1000 },
      (error, response, status) => {
        if (error) {
          console.error("Elasticsearch cluster is down!", error);
          process.exit(1);
        } else {
          console.log("Elasticsearch is running");
        }
      }
    );

    // Create product index if it doesn't exist
    const productIndexExists = await elasticsearchClient.indices.exists({
      index: "products",
    });
    if (!productIndexExists) {
      console.log("Index 'products' does not exist. Creating...");
      await elasticsearchClient.indices.create({
        index: "products",
        body: {
          settings: {
            analysis: {
              analyzer: {
                vietnamese_analyzer: {
                  tokenizer: "standard",
                  filter: ["lowercase", "asciifolding"],
                },
              },
            },
          },
          mappings: {
            properties: {
              name: {
                type: "text",
                analyzer: "vietnamese_analyzer",
                fields: {
                  keyword: { type: "keyword" },
                  completion: {
                    type: "completion",
                  },
                },
              },
              description: {
                type: "text",
                analyzer: "vietnamese_analyzer",
              },
              price: { type: "float" },
              cashbackPercentage: { type: "float" },
              categories: {
                type: "text",
                analyzer: "vietnamese_analyzer",
                fields: {
                  keyword: { type: "keyword" },
                },
              },
              shopId: { type: "keyword" },
              shopName: {
                type: "text",
                analyzer: "vietnamese_analyzer",
                fields: {
                  keyword: { type: "keyword" },
                },
              },
              platform: {
                type: "text",
                analyzer: "vietnamese_analyzer",
                fields: {
                  keyword: { type: "keyword" },
                },
              },
              url: { type: "keyword" },
              createdAt: { type: "date" },
              updatedAt: { type: "date" },
            },
          },
        },
      });
      console.log("Created products index");
    }

    // Create shop index if it doesn't exist
    const shopIndexExists = await elasticsearchClient.indices.exists({
      index: "shops",
    });
    if (!shopIndexExists) {
      console.log("Index 'shops' does not exist. Creating...");
      await elasticsearchClient.indices.create({
        index: "shops",
        body: {
          settings: {
            analysis: {
              analyzer: {
                vietnamese_analyzer: {
                  tokenizer: "standard",
                  filter: ["lowercase", "asciifolding"],
                },
              },
            },
          },
          mappings: {
            properties: {
              name: {
                type: "text",
                analyzer: "vietnamese_analyzer",
                fields: {
                  keyword: { type: "keyword" },
                  completion: {
                    type: "completion",
                  },
                },
              },
              description: {
                type: "text",
                analyzer: "vietnamese_analyzer",
              },
              categories: {
                type: "text",
                analyzer: "vietnamese_analyzer",
                fields: {
                  keyword: { type: "keyword" },
                },
              },
              platform: {
                type: "text",
                analyzer: "vietnamese_analyzer",
                fields: {
                  keyword: { type: "keyword" },
                },
              },
              url: { type: "keyword" },
              averageCashback: { type: "float" },
              createdAt: { type: "date" },
              updatedAt: { type: "date" },
            },
          },
        },
      });
      console.log("Created shops index");
    }
  } catch (error) {
    console.error("Elasticsearch setup error:", error);
    process.exit(1);
  }
};
