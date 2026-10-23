import express from "express";
import { getAvailableOrders ,acceptOrder,getMyAcceptedOrders,updateDeliveryLocation,getDeliveryDashboard} from "../controllers/deliveryController.js";
import { verifyDeliveryOtp } from "../controllers/deliveryController.js";
import isAuth from "../middlewares/isAuth.js";

const deliveryRouter = express.Router();

deliveryRouter.get("/available-orders",isAuth,getAvailableOrders);

deliveryRouter.post( "/accept/:assignmentId", isAuth, acceptOrder);
deliveryRouter.get("/my-accepted-orders",isAuth,  getMyAcceptedOrders);
deliveryRouter.post( "/verify-otp/:assignmentId",isAuth,verifyDeliveryOtp);
deliveryRouter.post("/update-location/:assignmentId",isAuth,updateDeliveryLocation);
deliveryRouter.get( "/dashboard",isAuth,getDeliveryDashboard);

export default deliveryRouter;