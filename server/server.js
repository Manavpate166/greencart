import express from 'express';
import cookieParser from 'cookie-parser';
import cors from "cors";
import connectDb from './configs/db.js';
import 'dotenv/config.js'; // Automatically loads environment variables from .env file
import userRouter from './routes/userRoute.js';
import sellerRouter from './routes/sellerRoute.js';
import connectCloudinary from './configs/cloudinay.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import addressRouter from './routes/addressRoute.js';
import orderRouter from './routes/OrderRoute.js';
import { stripeWebhook } from './controllers/orderController.js';




const app=express();
const PORT=process.env.PORT|| 4000;


await connectDb()
await connectCloudinary();
//allow multiple origins
const allowedOrigins=['http://localhost:5173','https://greencart-frontend-one.vercel.app']

app.post('/stripe',express.raw({type:"application/json"}),stripeWebhook)


// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({origin:allowedOrigins,credentials:true}));


app.get('/',(req,res)=>{
    res.send("Api is running");
})
app.use('/api/user',userRouter)
app.use('/api/seller',sellerRouter)
app.use('/api/product',productRouter)
app.use('/api/cart',cartRouter)
app.use('/api/address',addressRouter)
app.use('/api/order',orderRouter)



app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})