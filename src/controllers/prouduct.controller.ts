import { Request, Response } from "express";
import { linkProductSheet } from "../ultils/constant";

export const getProducts = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      searchTerm = "",
      shopName = "",
      sheetName = "Sheet1",
    } = req.query;

    const googleSheetApiUrl = linkProductSheet;

    const response = await fetch(
      `${googleSheetApiUrl}?page=${page}&limit=${limit}&searchTerm=${searchTerm}&shopName=${shopName}&sheetName=${sheetName}`
    );

    if (!response.ok) {
      throw new Error(
        `Error fetching data from Google Sheets API: ${response.statusText}`
      );
    }

    const data = await response.json();

    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
