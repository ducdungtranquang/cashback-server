import cluster from "cluster";
import os from "os";
import cron from "node-cron";
import BlacklistToken from "../../models/blackList.model";

const numCPUs = os.cpus().length;

if (cluster.isMaster) {
  console.log(`Master process ${process.pid} is running`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Forking new worker...`);
    cluster.fork();
  });
} else {
  if (cluster.worker!.id === 1) {
    console.log(`Worker ${process.pid} is running cron job`);

    cron.schedule("0 0 * * *", async () => {
      try {
        const now = new Date();
        await BlacklistToken.deleteMany({ expirationDate: { $lt: now } });
        console.log("Deleted expired tokens from blacklist at", now);
      } catch (error) {
        console.error("Error deleting expired tokens:", error);
      }
    });
  } else {
    console.log(`Worker ${process.pid} is NOT running cron job`);
  }
}
