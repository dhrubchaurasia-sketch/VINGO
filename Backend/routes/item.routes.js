import  express from "express";


import isAuth from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";
import {addItem,editItem,getItemById,deleteItem,getItemsByCity} from "../controllers/item.controllers.js";

const itemRouter = express.Router();

itemRouter.post("/add-item",isAuth,upload.single("image"), addItem);
itemRouter.put("/edit-item/:itemId",isAuth,upload.single("image"), editItem);
itemRouter.get("/get-item/:itemId",isAuth, getItemById);
itemRouter.delete("/delete-item/:itemId",isAuth, deleteItem);
itemRouter.get("/get-items-by-city/:city",isAuth, getItemsByCity);
export default itemRouter;