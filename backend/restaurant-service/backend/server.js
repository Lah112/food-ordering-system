import express from "express"
import cors from "cors"
import { connectDB } from "./config/db.js"
import foodRouter from "./routes/foodRoute.js"
import userRouter from "./routes/userRoute.js"
import dotenv from 'dotenv';
dotenv.config();
import "dotenv/config";
import cartRouter from "./routes/cartRoute.js"
import orderRouter from "./routes/orderRoute.js"
import adminRoutes from './routes/adminRoutes.js';
import restaurantRoutes from './routes/restaurantRoutes.js';


// app config
const app = express()
const port = process.env.PORT || 8080 || 4000

// middleware
app.use(express.json())
app.use(cors());
app.use('/api/admin', adminRoutes);
app.use('/api/restaurants', restaurantRoutes);


// db connection
connectDB();

// api endpoint
app.use("/api/food", foodRouter)
app.use("/images", express.static("uploads"))
app.use("/api/user", userRouter)
app.use("/api/cart", cartRouter)
app.use("/api/order", orderRouter)

app.get("/", (req, res)=>{
    res.send("API Working")
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})
