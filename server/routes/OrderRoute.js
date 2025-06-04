import express from 'express';
import { placeOrder,getAllOrders,getUserOrders,placeOrderStripe } from '../controllers/orderController.js';
import authUser from '../middlewares/authUser.js';





const orderRouter = express.Router();
orderRouter.post('/cod',authUser,placeOrder)
orderRouter.get('/user',authUser, getUserOrders);
orderRouter.get('/seller',authUser, getAllOrders);
orderRouter.post('/stripe',authUser,placeOrderStripe)
export default orderRouter;  //export the router