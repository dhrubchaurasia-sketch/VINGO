import uploadOnCloudinary from "../utils/cloudinary.js";
import Shop from "../models/shop.model.js";
import Item from "../models/item.model.js";
export const addItem = async (req, res) => {
  try {
    const { name, price, category, foodType } = req.body;
    let image;
    if(req.file){
        image = await uploadOnCloudinary(req.file.path);
    }
    const shop =await Shop.findOne({owner:req.user._id});
    if(!shop){
        return res.status(400).json({message:"Shop not found"});
    }
    const item = await Item.create({
        name,category,foodType,price,image,shop:shop._id
    })
    shop.items.unshift(item._id);
    await shop.save();
    await shop.populate("items owner");
    return res.status(201).json({message:"Item added successfully",shopId:shop._id,item});
  }catch(error) {
    return res.status(500).json({message:"Error adding item",error:error.message});
  }
}

export const editItem = async (req, res) => {
    try{
        const itemId = req.params.itemId;
        const { name, price, category, foodType } = req.body;
        let image;
        if(req.file){
            image = await uploadOnCloudinary(req.file.path);
        }
        const item = await Item.findByIdAndUpdate(itemId,{
            name,category,foodType,price,image
        },{new:true});
        return res.status(200).json({message:"Item edited successfully",item});
    }catch(error){
        return res.status(500).json({message:"Error editing item",error:error.message});
    }
}

export const getItemById = async (req, res) => {
    try{
        const itemId = req.params.itemId;
        const item = await Item.findById(itemId);
        if(!item){
            return res.status(404).json({message:"Item not found"});
        }
        return res.status(200).json({item});
    }catch(error){
        return res.status(500).json({message:"Error fetching item",error:error.message});
    }   
}

export const deleteItem = async (req, res) => {
    try {
        const itemId = req.params.itemId;

        // Pehle item find karo, delete mat karo
        const item = await Item.findById(itemId);

        if (!item) {
            return res.status(404).json({
                message: "Item not found"
            });
        }

        // Shop find karo
        const shop = await Shop.findById(item.shop);

        if (shop) {
            shop.items = shop.items.filter(
                i => i.toString() !== item._id.toString()
            );

            await shop.save();
        }

        // Sab kuch successful hone ke baad item delete karo
        await Item.findByIdAndDelete(itemId);

        return res.status(200).json({
            message: "Item deleted successfully"
        });

    } catch (error) {
        console.log("DELETE ITEM ERROR:", error);

        return res.status(500).json({
            message: "Error deleting item",
            error: error.message
        });
    }
};


export const getItemsByCity = async (req, res) => {
  try {
    const { city } = req.params;
    if (!city) {
      return res.status(400).json({
        message: "City parameter is required"
      });
    }
    const shops = await Shop.find({
      city: {
        $regex: new RegExp(`^${city}$`, "i")
      }
    })
      .populate("owner")
      .populate({
        path: "items",
        options: {
          sort: { createdAt: -1 }
        }
      });

    // Get shop IDs
    const shopIds = shops.map(shop => shop._id);

    // Get items belonging to those shops
    const itemsInCity = await Item.find({
      shop: {
        $in: shopIds
      }
    }).populate("shop");

    return res.status(200).json(itemsInCity);

  } catch (error) {
    return res.status(500).json({
      message: "Error fetching items by city",
      error: error.message
    });
  }
};
                                        