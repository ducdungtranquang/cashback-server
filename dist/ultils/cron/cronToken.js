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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cluster_1 = __importDefault(require("cluster"));
const os_1 = __importDefault(require("os"));
const node_cron_1 = __importDefault(require("node-cron"));
const blackList_model_1 = __importDefault(require("../../models/blackList.model"));
const numCPUs = os_1.default.cpus().length;
if (cluster_1.default.isMaster) {
    console.log(`Master process ${process.pid} is running`);
    for (let i = 0; i < numCPUs; i++) {
        cluster_1.default.fork();
    }
    cluster_1.default.on("exit", (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died. Forking new worker...`);
        cluster_1.default.fork();
    });
}
else {
    if (cluster_1.default.worker.id === 1) {
        console.log(`Worker ${process.pid} is running cron job`);
        node_cron_1.default.schedule("0 0 * * *", () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const now = new Date();
                yield blackList_model_1.default.deleteMany({ expirationDate: { $lt: now } });
                console.log("Deleted expired tokens from blacklist at", now);
            }
            catch (error) {
                console.error("Error deleting expired tokens:", error);
            }
        }));
    }
    else {
        console.log(`Worker ${process.pid} is NOT running cron job`);
    }
}
