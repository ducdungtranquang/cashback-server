import { Request, Response } from "express";
import { google } from "googleapis";
import { JWT } from "google-auth-library";
import User from "../models/user.model";
import { removeHttps } from "../ultils/func";

const PRIVATE_KEY = (process.env.GOOGLE_PRIVATE_KEY ||
  "GOOGLE_PRIVATE_KEY")!.replace(/\\n/g, "\n");
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL!;
const SHEET_ID = process.env.GOOGLE_SHEET_ID!;

const removeDiacritics = (str: string): string => {
  return str
    ?.trim()
    ?.normalize("NFD")
    ?.replace(/[\u0300-\u036f]/g, "");
};

const parsePrice = (priceStr: string): number => {
  const priceRange = priceStr.split("-");
  return parseFloat(priceRange[0].trim());
};

const authClient = new JWT({
  email: CLIENT_EMAIL,
  key: PRIVATE_KEY,
  keyFile: "./google.json",
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

export const getProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const sheetName = (req.query.sheetName as string) || "Tất cả";
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const searchTerm = req.query.searchTerm
      ? removeDiacritics((req.query.searchTerm as string).toLowerCase()?.trim())
      : "";
    const shopName = req.query.shopName
      ? removeDiacritics((req.query.shopName as string).toLowerCase()?.trim())
      : "";
    const sort = (req.query.sort as string) || "sales";

    const sheets = google.sheets({ version: "v4", auth: authClient });

    const startRow = (page - 1) * limit + 2; // Sheets are 1-indexed, not 0-indexed
    const endRow = startRow + limit - 1;

    const range = `${sheetName}!A${startRow}:G${endRow}`; // Adjust A:G to your actual data range

    const sheetResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: range,
    });

    if (!sheetResponse.data.values) {
      throw new Error(`No data found in sheet "${sheetName}".`);
    }

    const rows = sheetResponse.data.values;

    let filteredData = rows.filter((row: any) => {
      const productName = removeDiacritics(row[0]?.toLowerCase()?.trim());
      const shop = removeDiacritics(row[5]?.toLowerCase()?.trim());

      const matchesProduct = productName?.includes(searchTerm);
      const matchesShop = shop?.includes(shopName || searchTerm);

      if (shopName) return matchesShop;
      return matchesProduct || matchesShop;
    });

    const result = filteredData.map((row: any) => ({
      name: row[0],
      price: row[1],
      link: row[2],
      commission: row[3],
      sales: row[4],
      shop: row[5],
      img: row[6],
    }));

    const parseSales = (salesStr: string): number => {
      if (!salesStr) return 0;

      const trimmedStr = salesStr.trim().replace(/,/g, ".");
      const lastChar = trimmedStr.slice(-1).toLowerCase();

      if (lastChar === "k") {
        return parseFloat(trimmedStr.slice(0, -1)) * 1000;
      } else if (lastChar === "m") {
        return parseFloat(trimmedStr.slice(0, -1)) * 1000000;
      } else {
        return parseFloat(trimmedStr);
      }
    };

    if (sort === "price-asc") {
      result.sort(
        (a: any, b: any) => parsePrice(a["price"]) - parsePrice(b["price"])
      );
    } else if (sort === "price-desc") {
      result.sort(
        (a: any, b: any) => parsePrice(b["price"]) - parsePrice(a["price"])
      );
    } else if (sort === "sales") {
      result.sort(
        (a: any, b: any) => parseSales(b["sales"]) - parseSales(a["sales"])
      );
    }

    res.json({
      currentPage: page,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const sheetName = (req.query.sheetName as string) || "Tất cả";
    const productId = req.params.id;

    const sheets = google.sheets({ version: "v4", auth: authClient });

    const range = `${sheetName}!A2:G`;

    const sheetResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: range,
    });

    if (!sheetResponse.data.values) {
      throw new Error(`No data found in sheet "${sheetName}".`);
    }

    const rows = sheetResponse.data.values;

    const product = rows.find((row: any) => {
      const link = row[2];
      return removeHttps(link) === productId;
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const result = {
      name: product[0],
      price: product[1],
      link: product[2],
      commission: product[3],
      sales: product[4],
      shop: product[5],
      img: product[6],
    };

    return res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getShops = async (req: Request, res: Response): Promise<void> => {
  try {
    const sheetName = (req.query.sheetName as string) || "Tất cả";
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const searchTerm = req.query.searchTerm
      ? removeDiacritics((req.query.searchTerm as string).toLowerCase()?.trim())
      : "";

    const sheets = google.sheets({ version: "v4", auth: authClient });

    const range = `${sheetName}!A2:G`;

    const sheetResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: range,
    });

    if (!sheetResponse.data.values) {
      throw new Error(`No data found in sheet "${sheetName}".`);
    }

    const rows = sheetResponse.data.values;

    const shopData = rows.reduce((acc: any, row: any) => {
      const shop = removeDiacritics(row[5]?.toLowerCase()?.trim());
      const product = {
        name: row[0],
        commission: parseFloat(row[3]) + 1,
        img: row[6],
      };

      if (shop) {
        if (!acc[shop]) {
          acc[shop] = [];
        }
        acc[shop].push(product);
      }

      return acc;
    }, {});

    let shops = Object.keys(shopData)
      .filter((shop) => shop.includes(searchTerm))
      .map((shop) => {
        const products = shopData[shop];
        const firstProduct = products[0];
        return {
          shop: shop,
          firstProductImg: firstProduct?.img || "",
          firstProductCommission: firstProduct?.commission || 0,
        };
      });

    const totalShops = shops.length;
    const startIndex = (page - 1) * limit;
    const endIndex = Math.min(startIndex + limit, totalShops);

    const paginatedShops = shops.slice(startIndex, endIndex);

    res.json({
      currentPage: page,
      totalPages: Math.ceil(totalShops / limit),
      totalShops,
      shops: paginatedShops,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCounts = async (req: Request, res: Response): Promise<any> => {
  try {
    if (!req.user || (req.user as any).role <= 0) {
      return res.status(403).json({ error: "Forbidden: Insufficient role" });
    }

    const sheetName = (req.query.sheetName as string) || "Tất cả";

    const sheets = google.sheets({ version: "v4", auth: authClient });

    const range = `${sheetName}!A2:G`;

    const sheetResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: range,
    });

    if (!sheetResponse.data.values) {
      throw new Error(`No data found in sheet "${sheetName}".`);
    }

    const rows = sheetResponse.data.values;

    const productCount = rows.length;

    const userCount = await User.countDocuments({});

    const shopSet = new Set<string>();
    rows.forEach((row: any) => {
      const shopName = removeDiacritics(row[5]?.toLowerCase()?.trim());
      if (shopName) {
        shopSet.add(shopName);
      }
    });

    const shopCount = shopSet.size;

    res.json({
      productCount,
      shopCount,
      userCount,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

const sheets = google.sheets({ version: "v4", auth: authClient });

export const addProduct = async (req: Request, res: Response) => {
  try {
    const sheetName = (req.body.sheetName as string) || "Tất cả";
    const product = req.body;

    if (!product.name || !product.price || !product.link) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const range = `${sheetName}!A:G`;

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            product.name,
            product.price,
            product.link,
            product.commission || "",
            product.sales || "",
            product.shop || "",
            product.img || "",
          ],
        ],
      },
    });

    res.status(201).json({ message: "Product added successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const sheetName = (req.body.sheetName as string) || "Tất cả";
    const productId = req.params.id;
    const updatedData = req.body;

    const range = `${sheetName}!A2:G`;
    const sheetResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range,
    });

    if (!sheetResponse.data.values) {
      return res.status(404).json({ message: "No data found" });
    }

    const rows = sheetResponse.data.values;
    const rowIndex = rows.findIndex(
      (row: any) => removeHttps(row[2]) === productId
    );

    if (rowIndex === -1) {
      return res.status(404).json({ message: "Product not found" });
    }

    const updatedRow = [
      updatedData.name || rows[rowIndex][0],
      updatedData.price || rows[rowIndex][1],
      updatedData.link || rows[rowIndex][2],
      updatedData.commission || rows[rowIndex][3],
      updatedData.sales || rows[rowIndex][4],
      updatedData.shop || rows[rowIndex][5],
      updatedData.img || rows[rowIndex][6],
    ];

    const updateRange = `${sheetName}!A${rowIndex + 2}:G${rowIndex + 2}`;

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: updateRange,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [updatedRow] },
    });

    res.json({ message: "Product updated successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const sheetName = (req.query.sheetName as string) || "Tất cả";
    const productId = req.params.id;

    const range = `${sheetName}!A2:G`;
    const sheetResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range,
    });

    if (!sheetResponse.data.values) {
      return res.status(404).json({ message: "No data found" });
    }

    const rows = sheetResponse.data.values;
    const rowIndex = rows.findIndex(
      (row: any) => removeHttps(row[2]) === productId
    );

    if (rowIndex === -1) {
      return res.status(404).json({ message: "Product not found" });
    }

    const emptyRow = ["", "", "", "", "", "", ""]; 
    rows[rowIndex] = emptyRow;

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: rows },
    });

    res.json({ message: "Product deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: error.message });
  }
};
