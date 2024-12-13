import express from "express";
import userRoutes from "./featuresets/user/user.routes";
import "express-async-errors";
import { errorHandler } from "./middleware/errors";

const app = express();
const port = 3000;

app.use(express.json());

// Routes
app.use(userRoutes);

// Error handling
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
