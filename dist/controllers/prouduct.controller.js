"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProducts = void 0;
const constant_1 = require("../ultils/constant");
const getProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 10, searchTerm = "", shopName = "", sheetName = "All", } = req.query;
        const googleSheetApiUrl = constant_1.linkProductSheet;
        const response = yield fetch(`${googleSheetApiUrl}?page=${page}&limit=${limit}&searchTerm=${searchTerm}&shopName=${shopName}&sheetName=${sheetName}`);
        if (!response.ok) {
            throw new Error(`Error fetching data from Google Sheets API: ${response.statusText}`);
        }
        const data = yield response.json();
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getProducts = getProducts;
