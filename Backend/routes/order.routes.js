import  express from "express";
import isAuth from "../middlewares/isAuth.js";
import {placeOrder,getMyOrders, getOwnerOrders,updateOrderStatus,createRazorpayOrder,verifyRazorpayPayment} from "../controllers/order.controllers.js";


const orderRouter = express.Router();

orderRouter.post("/place-order",isAuth,placeOrder);
orderRouter.get("/my-orders", isAuth, getMyOrders);
orderRouter.get("/owner-orders", isAuth, getOwnerOrders);
orderRouter.put( "/:orderId/shop-order/:shopOrderId/status", isAuth, updateOrderStatus);
orderRouter.post( "/create-payment-order", isAuth, createRazorpayOrder );
orderRouter.post( "/verify-payment", isAuth, verifyRazorpayPayment );
 
export default orderRouter;

