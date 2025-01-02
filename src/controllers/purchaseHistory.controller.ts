import { Request, Response } from 'express';
import PurchaseHistory from '../models/purchaseHistory.model';

export const savePurchaseHistory = async (req: Request, res: Response) => {
    try {
        const { productName, price, productLink, cashbackPercentage, quantity } = req.body;

        if (!productName || !price || !productLink || !cashbackPercentage || !quantity) {
            return res.status(400).json({ message: 'Please provide all required fields.' });
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
        console.error('Error saving purchase history:', error);
        res.status(500).json({ message: 'Server error, please try again later.' });
    }
};

export const getPurchaseHistory = async (req: Request, res: Response) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = 20;

        const total = await PurchaseHistory.countDocuments({ userId: (req?.user as any)._id });

        const purchaseHistory = await PurchaseHistory.find({ userId: (req?.user as any)._id })
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
        console.error('Error fetching purchase history:', error);
        res.status(500).json({ message: 'Server error, please try again later.' });
    }
}

interface APIData {
  merchant: string;
  status: number;
  transaction_time: string;
  transaction_value: number;
  product_quantity: number;
  transaction_id: string;
  click_url: string;
  utm_source: string;
}

interface APIResponse {
  total: number;
  data: APIData[];
}

const fetchDataFromAPI = async (): Promise<APIResponse> => {
  const apiUrl = 'https://api.accesstrade.vn/v1/transactions?since=2021-01-01T00:00:00Z&until=2025-01-03T00';
  const response = await fetch(apiUrl, {
    headers: {
      Authorization: 'Token b2YarfQvCZooDdHSNMIJoQYwawTP_cqY',
    },
  });
  if (!response.ok) {
    console.log("response", response)
  }
  return response.json();
};

const saveToDatabase = async (data: APIData[]) => {
  for (const item of data) {
    const existingRecord = await PurchaseHistory.findOne({ transaction_id: item.transaction_id });
    if (!existingRecord) {
      const newRecord = new PurchaseHistory({
        userId: "utm_source",
        productName: item.merchant, 
        price: item.transaction_value,
        productLink: item.click_url,
        cashbackPercentage: 0, 
        quantity: item.product_quantity,
        purchaseDate: new Date(item.transaction_time),
      });
      await newRecord.save();
    }
  }
};

export const fetchAndSaveData = async (req: Request, res: Response) => {
  try {
    const apiResponse = await fetchDataFromAPI();

    const transformedData = apiResponse.data.map((item) => ({
      merchant: item.merchant,
      status: item.status,
      transaction_time: item.transaction_time,
      transaction_value: item.transaction_value,
      product_quantity: item.product_quantity,
      transaction_id: item.transaction_id,
      click_url: item.click_url,
      utm_source: item.utm_source
    }));

    await saveToDatabase(transformedData);

    res.status(200).json({
      total: apiResponse.total,
      data: transformedData,
    });
  } catch (error) {
    console.error('Error fetching, transforming, or saving data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
