import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

import chatRoute from "./routes/chatRoute.js";
import { errorHandler } from "./middlewares/errorMiddleware.js";
import { PORT } from "./config/serverConfig.js";

dotenv.config();

const app = express();

app.use(cors({ origin: "*" }));

app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
});
app.use(limiter);

app.use("/api", chatRoute);

app.use(errorHandler);

app.listen(PORT || 5000, () => {
  console.log(`Server running on port ${PORT}`);
});
