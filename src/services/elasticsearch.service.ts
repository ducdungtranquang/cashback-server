import { elasticsearchClient } from "../config/elasticsearch";
import { IProduct } from "../models/product.model";
import { IShop } from "../models/shop.model";

class ElasticsearchService {
  async indexProduct(product: IProduct) {
    const normalizedName = normalizeVietnamese(product.name);
    const normalizedDescription = normalizeVietnamese(product.description);

    await elasticsearchClient.index({
      index: "products",
      id: product._id.toString(),
      type: "_doc",
      body: {
        name: product.name,
        normalizedName, // Store normalized version for search
        description: product.description,
        normalizedDescription,
        price: product.price,
        cashbackPercentage: product.cashbackPercentage,
        categories: product.categories,
        shopId: product.shopId.toString(),
        shopName: product.shopName,
        platform: product.platform,
        url: product.url,
        active: product.active,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      },
    });
  }

  async deleteProduct(productId: string) {
    elasticsearchClient.delete({
      index: "products",
      id: productId,
      type: "",
    });
  }

  async indexShop(shop: IShop) {
    const normalizedName = normalizeVietnamese(shop.name);
    const normalizedDescription = shop.description
      ? normalizeVietnamese(shop.description)
      : "";

    await elasticsearchClient.index({
      index: "shops",
      id: shop._id.toString(),
      type: "_doc",
      body: {
        name: shop.name,
        normalizedName,
        description: shop.description,
        normalizedDescription,
        categories: shop.categories,
        platform: shop.platform,
        logo: shop.logo,
        url: shop.url,
        averageCashback: shop.averageCashback,
        active: shop.active,
        createdAt: shop.createdAt,
        updatedAt: shop.updatedAt,
      },
    });

    console.log("Indexing shop:", shop.name);
  }

  async deleteShop(shopId: string) {
    elasticsearchClient.delete({
      index: "shops",
      id: shopId,
      type: "",
    });
  }

  async searchProducts(
    query: string,
    filters: any = {},
    sort: any = {},
    page = 1,
    limit = 20
  ) {
    const from = (page - 1) * limit;
    const mustQueries = [];

    // Only include active products
    mustQueries.push({
      term: {
        active: true,
      },
    });

    // Main search query for product name, description, categories and platform
    if (query) {
      // Normalize the query to handle accented Vietnamese characters
      const normalizedQuery = normalizeVietnamese(query);

      mustQueries.push({
        bool: {
          should: [
            // Search in original fields with higher boost
            {
              multi_match: {
                query,
                fields: [
                  "name^3",
                  "description",
                  "categories^2",
                  "platform",
                  "shopName^2",
                ],
                fuzziness: "AUTO",
                boost: 2,
              },
            },
            // Search in normalized fields
            {
              multi_match: {
                query: normalizedQuery,
                fields: [
                  "normalizedName^3",
                  "normalizedDescription",
                  "categories^2",
                  "platform",
                  "shopName^2",
                ],
                fuzziness: "AUTO",
              },
            },
          ],
          minimum_should_match: 1,
        },
      });
    }

    // Category filter
    if (filters.category) {
      mustQueries.push({
        term: {
          "categories.keyword": filters.category,
        },
      });
    }

    // Shop filter
    if (filters.shopId) {
      mustQueries.push({
        term: {
          shopId: filters.shopId,
        },
      });
    }

    // Shop name filter
    if (filters.shopName) {
      mustQueries.push({
        match: {
          shopName: filters.shopName,
        },
      });
    }

    // Platform filter
    if (filters.platform) {
      mustQueries.push({
        term: {
          "platform.keyword": filters.platform,
        },
      });
    }

    // Price range filter
    if (filters.minPrice || filters.maxPrice) {
      const priceRange: any = {};
      if (filters.minPrice) priceRange.gte = filters.minPrice;
      if (filters.maxPrice) priceRange.lte = filters.maxPrice;

      mustQueries.push({
        range: {
          price: priceRange,
        },
      });
    }

    // Cashback range filter
    if (filters.minCashback || filters.maxCashback) {
      const cashbackRange: any = {};
      if (filters.minCashback) cashbackRange.gte = filters.minCashback;
      if (filters.maxCashback) cashbackRange.lte = filters.maxCashback;

      mustQueries.push({
        range: {
          cashbackPercentage: cashbackRange,
        },
      });
    }

    // Define sort options
    const sortOptions = [];

    if (sort.price) {
      sortOptions.push({
        price: { order: sort.price === "asc" ? "asc" : "desc" },
      });
    }

    if (sort.cashback) {
      sortOptions.push({
        cashbackPercentage: { order: sort.cashback === "asc" ? "asc" : "desc" },
      });
    }

    // If no sort specified, default to relevance
    if (sortOptions.length === 0) {
      sortOptions.push({ _score: { order: "desc" } });
    }

    const searchBody: any = {
      from,
      size: limit,
      query: {
        bool: {
          must: mustQueries.length > 0 ? mustQueries : [{ match_all: {} }],
        },
      },
      sort: sortOptions,
    };

    // Add highlighting
    if (query) {
      searchBody.highlight = {
        fields: {
          name: {},
          description: {},
        },
        pre_tags: ["<strong>"],
        post_tags: ["</strong>"],
      };
    }

    const body = (await elasticsearchClient.search({
      index: "products",
      body: searchBody,
    }));

    console.log(body);

    const total = body?.hits.total;
    const results = body?.hits.hits.map((hit: any) => ({
      id: hit._id,
      score: hit._score,
      highlights: hit.highlight,
      ...hit._source,
    }));

    return {
      results,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async searchShops(query: string, filters: any = {}, page = 1, limit = 20) {
    const from = (page - 1) * limit;
    const mustQueries = [];

    // Only include active shops
    mustQueries.push({
      term: {
        active: true,
      },
    });

    // Main search query for shop name, description, categories and platform
    if (query) {
      // Normalize the query to handle accented Vietnamese characters
      const normalizedQuery = normalizeVietnamese(query);

      mustQueries.push({
        bool: {
          should: [
            // Search in original fields with higher boost
            {
              multi_match: {
                query,
                fields: ["name^3", "description", "categories^2", "platform"],
                fuzziness: "AUTO",
                boost: 2,
              },
            },
            // Search in normalized fields
            {
              multi_match: {
                query: normalizedQuery,
                fields: [
                  "normalizedName^3",
                  "normalizedDescription",
                  "categories^2",
                  "platform",
                ],
                fuzziness: "AUTO",
              },
            },
          ],
          minimum_should_match: 1,
        },
      });
    }

    // Category filter
    if (filters.category) {
      mustQueries.push({
        term: {
          "categories.keyword": filters.category,
        },
      });
    }

    // Platform filter
    if (filters.platform) {
      mustQueries.push({
        term: {
          "platform.keyword": filters.platform,
        },
      });
    }

    const searchBody: any = {
      from,
      size: limit,
      query: {
        bool: {
          must: mustQueries.length > 0 ? mustQueries : [{ match_all: {} }],
        },
      },
      sort: [
        { averageCashback: { order: "desc" } },
        { _score: { order: "desc" } },
      ],
    };

    // Add highlighting
    if (query) {
      searchBody.highlight = {
        fields: {
          name: {},
          description: {},
        },
        pre_tags: ["<strong>"],
        post_tags: ["</strong>"],
      };
    }

    const body = (await elasticsearchClient.search({
      index: "shops",
      body: searchBody,
    }));

    const total = body?.hits.total;
    const results = body?.hits.hits.map((hit: any) => ({
      id: hit._id,
      score: hit._score,
      highlights: hit.highlight,
      ...hit._source,
    }));

    return {
      results,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getSuggestions(query: string, limit = 10) {
    if (!query.trim()) {
      return { products: [], shops: [] };
    }

    const normalizedQuery = normalizeVietnamese(query);

    // Product suggestions
    const productResults: any = await elasticsearchClient.search({
      index: "products",
      body: {
        size: limit,
        _source: [
          "name",
          "shopName",
          "categories",
          "price",
          "cashbackPercentage",
        ],
        query: {
          bool: {
            must: [{ term: { active: true } }],
            should: [
              // Match on name with prefix
              { prefix: { "name.keyword": query } },
              // Match on normalized name with prefix
              { prefix: { "normalizedName.keyword": normalizedQuery } },
              // More fuzzy match on name
              {
                match: {
                  name: {
                    query,
                    fuzziness: "AUTO",
                  },
                },
              },
              // Match on normalized name
              {
                match: {
                  normalizedName: {
                    query: normalizedQuery,
                    fuzziness: "AUTO",
                  },
                },
              },
            ],
            minimum_should_match: 1,
          },
        },
      },
    });

    // Shop suggestions
    const shopResults: any = await elasticsearchClient.search({
      index: "shops",
      body: {
        size: limit,
        _source: ["name", "categories", "platform", "averageCashback"],
        query: {
          bool: {
            must: [{ term: { active: true } }],
            should: [
              // Match on name with prefix
              { prefix: { "name.keyword": query } },
              // Match on normalized name with prefix
              { prefix: { "normalizedName.keyword": normalizedQuery } },
              // More fuzzy match on name
              {
                match: {
                  name: {
                    query,
                    fuzziness: "AUTO",
                  },
                },
              },
              // Match on normalized name
              {
                match: {
                  normalizedName: {
                    query: normalizedQuery,
                    fuzziness: "AUTO",
                  },
                },
              },
            ],
            minimum_should_match: 1,
          },
        },
      },
    });

    const products: any = productResults?.hits.hits.map((hit: any) => ({
      id: hit._id,
      type: "product",
      name: hit._source.name,
      shopName: hit._source.shopName,
      price: hit._source.price,
      cashbackPercentage: hit._source.cashbackPercentage,
      category: hit._source.categories[0],
    }));

    const shops = shopResults?.hits.hits.map((hit: any) => ({
      id: hit._id,
      type: "shop",
      name: hit._source.name,
      platform: hit._source.platform,
      averageCashback: hit._source.averageCashback,
      category: hit._source.categories[0],
    }));

    return {
      products,
      shops,
    };
  }

  // Reindex all products from MongoDB
  async reindexAllProducts(products: IProduct[]) {
    console.log(`Reindexing ${products.length} products...`);

    // Delete all products first
    try {
      await elasticsearchClient.indices.delete({
        index: "products",
      });
    } catch (error) {
      // Ignore if index doesn't exist
    }

    // Recreate the index
    await setupElasticsearch();

    // Bulk index
    if (products.length === 0) return;

    const body = products.flatMap((product) => [
      { index: { _index: "products", _id: product._id.toString() } },
      {
        name: product.name,
        normalizedName: normalizeVietnamese(product.name),
        description: product.description,
        normalizedDescription: normalizeVietnamese(product.description),
        price: product.price,
        cashbackPercentage: product.cashbackPercentage,
        categories: product.categories,
        shopId: product.shopId.toString(),
        shopName: product.shopName,
        platform: product.platform,
        url: product.url,
        active: product.active,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      },
    ]);

    await elasticsearchClient.bulk({ body });
    console.log("Products reindexed successfully");
  }

  // Reindex all shops from MongoDB
  async reindexAllShops(shops: IShop[]) {
    console.log(`Reindexing ${shops.length} shops...`);

    // Delete all shops first
    try {
      await elasticsearchClient.indices.delete({
        index: "shops",
      });
    } catch (error) {
      // Ignore if index doesn't exist
    }

    // Recreate the index
    await setupElasticsearch();

    // Bulk index
    if (shops.length === 0) return;

    const body = shops.flatMap((shop) => [
      { index: { _index: "shops", _id: shop._id.toString() } },
      {
        name: shop.name,
        normalizedName: normalizeVietnamese(shop.name),
        description: shop.description,
        normalizedDescription: shop.description
          ? normalizeVietnamese(shop.description)
          : "",
        categories: shop.categories,
        platform: shop.platform,
        logo: shop.logo,
        url: shop.url,
        averageCashback: shop.averageCashback,
        active: shop.active,
        createdAt: shop.createdAt,
        updatedAt: shop.updatedAt,
      },
    ]);

    await elasticsearchClient.bulk({ body });
    console.log("Shops reindexed successfully");
  }
}

export const elasticsearchService = new ElasticsearchService();

// Importing here to avoid circular dependency
import { setupElasticsearch } from "../config/elasticsearch";
import { normalizeVietnamese } from "../ultils/vietnamese-utils";import { log } from "console";

