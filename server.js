import express from "express";
import colors from "colors";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./config/db.js";
import authRoutes from './routes/authRoutes.js';
import cors from "cors";
import categoryroute from "./routes/Categoryroutes.js";
import productroutes from "./routes/ProductRoutes.js";
import bodyParser from "body-parser";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(morgan("dev"));  // Logging
app.use(cors());         // Enable CORS
app.use(express.json({ limit: '50mb' })); // JSON parser with increased limit
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true })); // For form-encoded data

// Database connection
connectDB();

// Routes
app.use('/api/auth', authRoutes); 
app.use('/api/categories', categoryroute); 
app.use('/api/product', productroutes); 

// Default route
app.get("/", (req, res) => {
  res.send("Welcome to my ecommerce website at MERN app 2024");
});
app.use("*",function(req,res){
  res.sendFile(path.join(__dirname,"./client/build/index.html"))
})

// Port setup and listener
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Listening in ${process.env.DEV_MODE} mode on port ${PORT}`.bgCyan.bgBlue);
});
