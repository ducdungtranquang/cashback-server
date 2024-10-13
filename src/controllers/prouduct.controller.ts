import { Request, Response } from "express";
import { google } from "googleapis";
import { JWT } from "google-auth-library";

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

export const getProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const sheetName = (req.query.sheetName as string) || "Sheet1";
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const searchTerm = req.query.searchTerm
      ? removeDiacritics((req.query.searchTerm as string).toLowerCase()?.trim())
      : "";
    const shopName = req.query.shopName
      ? removeDiacritics((req.query.shopName as string).toLowerCase()?.trim())
      : "";
    const sort = (req.query.sort as string) || "sales";

    const authClient = new JWT({
      email: CLIENT_EMAIL,
      key: PRIVATE_KEY,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth: authClient });

    // Calculate startRow and endRow based on page and limit
    const startRow = (page - 1) * limit + 2; // Sheets are 1-indexed, not 0-indexed
    const endRow = startRow + limit - 1;

    // Fetch the range of rows (adjust columns as per your data)
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

    if (sort === "price") {
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
    } else {
      result.sort(
        (a: any, b: any) => parseSales(a["sales"]) - parseSales(b["sales"])
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
