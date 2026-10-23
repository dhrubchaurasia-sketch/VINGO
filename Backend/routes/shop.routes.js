import  express from "express";
import  {upload} from "../middlewares/multer.js";
import {createEditShop,getMyShop,addFoodItem,getShopByCity} from "../controllers/shop.controllers.js";
import isAuth from "../middlewares/isAuth.js";


const shopRouter = express.Router();

shopRouter.post("/create-edit",isAuth,upload.single("image"), createEditShop);
shopRouter.get("/get-my",isAuth,getMyShop);
shopRouter.post( "/add-food-items", isAuth,upload.single("image"),addFoodItem);
shopRouter.get("/by-city/:city", getShopByCity);  
export default shopRouter;