import { Request, Response } from "express";
import PurchaseHistory from "../models/purchaseHistory.model";
import User from "../models/user.model";
import { extractId } from "../ultils/func";

export const savePurchaseHistory = async (req: Request, res: Response) => {
  try {
    const { productName, price, productLink, cashbackPercentage, quantity } =
      req.body;

    if (
      !productName ||
      !price ||
      !productLink ||
      !cashbackPercentage ||
      !quantity
    ) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields." });
    }

    const purchaseHistory = await PurchaseHistory.create({
      userId: (req?.user as any)._id,
      productName,
      price,
      productLink,
      cashbackPercentage,
      quantity,
    });

    res.status(201).json(purchaseHistory);
  } catch (error) {
    console.error("Error saving purchase history:", error);
    res.status(500).json({ message: "Server error, please try again later." });
  }
};

export const getPurchaseHistory = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = 20;

    const total = await PurchaseHistory.countDocuments({
      userId: (req?.user as any)._id,
    });

    const purchaseHistory = await PurchaseHistory.find({
      userId: (req?.user as any)._id,
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    res.json({
      page,
      pages: Math.ceil(total / limit),
      total,
      purchaseHistory,
    });
  } catch (error) {
    console.error("Error fetching purchase history:", error);
    res.status(500).json({ message: "Server error, please try again later." });
  }
};

interface APIData {
  merchant: string;
  status: number;
  transaction_time: string;
  transaction_value: number;
  product_quantity: number;
  transaction_id: string;
  click_url: string;
  utm_source: string;
  product_price: number;
  reason_rejected?: string;
  commission: number | 0;
}

interface APIResponse {
  total: number;
  data: APIData[];
}

const fetchDataFromAPI = async (params: {
  utm_source?: string;
  merchant?: string;
  limit?: number;
  status?: number;
}): Promise<APIResponse> => {
  const { utm_source, merchant, limit, status } = params;

  let apiUrl = "https://api.accesstrade.vn/v1/transactions?";
  apiUrl += `since=2021-01-01T00:00:00Z&until=2026-01-03T00`;
  if (utm_source) apiUrl += `&utm_source=${utm_source}`;
  if (merchant) apiUrl += `&merchant=${merchant}`;
  if (limit) apiUrl += `&limit=${limit}`;
  if (status !== undefined) apiUrl += `&status=${status}`;

  const response = await fetch(apiUrl, {
    headers: {
      Authorization: "Token b2YarfQvCZooDdHSNMIJoQYwawTP_cqY",
    },
  });

  if (!response.ok) {
    console.error("API call failed", response.statusText);
    throw new Error("Failed to fetch data from API");
  }

  return response.json();
};

const saveToDatabase = async (data: APIData[]) => {
  for (const item of data) {
    if (item.utm_source) {
      const existingRecord = await PurchaseHistory.findOne({
        transaction_id: item.transaction_id,
      });

      if (!existingRecord) {
        const user = await User.findById(item.utm_source);
        const newRecord = new PurchaseHistory({
          userId: item.utm_source,
          productName: item.merchant,
          price: item.transaction_value,
          productLink: item.click_url,
          cashbackPercentage: 0,
          cashback: item.commission,
          quantity: item.product_quantity,
          purchaseDate: new Date(item.transaction_time),
          transaction_id: item.transaction_id,
          status:
            item.status === 1
              ? "Đã duyệt"
              : item.status === 0
              ? "Đang xử lý"
              : "Hủy",
        });
        await newRecord.save();
        if (user) {
          user.money! += item.commission;
          await user.save();
        }
      }
    }
  }
};

export const fetchAndSaveDataAffiliate = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.user || (req.user as any).role <= 0) {
      return res.status(403).json({ error: "Forbidden: Insufficient role" });
    }

    const { utm_source, merchant, limit, status } = req.body;
    const apiResponse = await fetchDataFromAPI({
      utm_source: utm_source && `j:"${utm_source}"`,
      merchant,
      limit,
      status,
    });

    const userData = await Promise.all(
      apiResponse.data.map(async (item) => {
        const userId = extractId(item.utm_source);
        const user = userId
          ? await User.findById(userId).select("name email")
          : null;

        return {
          ...item,
          userName: user?.name || "Không xác định",
          email: user?.email || "Không xác định",
        };
      })
    );

    const transformedData = apiResponse.data.map((item) => ({
      merchant: item.merchant,
      status: item.status,
      transaction_time: item.transaction_time,
      transaction_value: item.transaction_value,
      product_quantity: item.product_quantity,
      transaction_id: item.transaction_id,
      click_url: item.click_url,
      utm_source: extractId(item.utm_source),
      product_price: item.product_price,
      commission: item.commission,
      reason_rejected: item.reason_rejected,
    }));

    await saveToDatabase(transformedData);

    res.status(200).json({
      total: apiResponse.total,
      userData: userData,
    });
  } catch (error) {
    console.error("Error fetching, transforming, or saving data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
