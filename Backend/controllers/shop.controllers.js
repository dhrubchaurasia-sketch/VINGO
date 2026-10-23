import uploadOnCloudinary from "../utils/cloudinary.js";
import Shop from "../models/shop.model.js";
import Item from "../models/item.model.js";
export const createEditShop = async (req, res) => {
  try {
    const { shopId, name, city, state, address, latitude, longitude } =
      req.body;

    // Validate GPS coordinates when provided
    let locationUpdate = null;

    if (latitude !== undefined && longitude !== undefined) {
      const lat = Number(latitude);
      const lng = Number(longitude);

      if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lng) ||
        lat < -90 ||
        lat > 90 ||
        lng < -180 ||
        lng > 180
      ) {
        return res.status(400).json({
          message: "Invalid restaurant GPS coordinates.",
        });
      }

      locationUpdate = {
        latitude: lat,
        longitude: lng,
      };
    }

    let shop;

    if (shopId) {
      // Find the shop owned by the logged-in user
      shop = await Shop.findOne({
        _id: shopId,
        owner: req.user._id,
      });

      if (!shop) {
        return res.status(404).json({
          message: "Shop not found",
        });
      }

      let image = shop.image;

      if (req.file) {
        image = await uploadOnCloudinary(req.file.path);
      }

      shop.name = name;
      shop.city = city;
      shop.state = state;
      shop.address = address;
      shop.image = image;

      // Update GPS location only when new coordinates are provided
      if (locationUpdate) {
        shop.location = locationUpdate;
      }

      await shop.save();
    } else {
      if (!req.file) {
        return res.status(400).json({
          message: "Shop image is required",
        });
      }

      const image = await uploadOnCloudinary(req.file.path);

      shop = await Shop.create({
        name,
        city,
        state,
        address,
        image,
        owner: req.user._id,
        location: locationUpdate || {
          latitude: null,
          longitude: null,
        },
      });

      req.user.shops.push(shop._id);
      await req.user.save();
    }

    await shop.populate("owner");

    return res.status(201).json(shop);
  } catch (error) {
    console.error("CREATE/EDIT SHOP ERROR:", error);

    return res.status(500).json({
      message: "Error creating/editing shop",
      error: error.message,
    });
  }
};



export const getMyShop = async (req, res) => {
  try{
    const shop = await Shop.findOne({ owner: req.user._id }).populate("owner") .populate({
        path: "items",
        options: { sort: { createdAt: -1 } }
      });
    if(!shop){
      return res.status(404).json({ message: "Shop not found" });
    }
    return res.status(200).json(shop);
  } catch (error) {
    // console.log("GET MY SHOP ERROR:", error);
    return res.status(500).json({
      message: "getMyShop  fetching error",
      error: error.message,
    });
  }
};

export const addFoodItem = async (req, res) => {
  try {
    const { name, price, category, foodType } = req.body;

    // console.log("FOOD DATA:", req.body);
    // console.log("FOOD FILE:", req.file);

    if (!req.file) {
      return res.status(400).json({
        message: "Food image is required",
      });
    }

    const shop = await Shop.findOne({
      owner: req.user._id,
    });

    if (!shop) {
      return res.status(404).json({
        message: "Shop not found",
      });
    }

    const image = await uploadOnCloudinary(req.file.path);

    const item = await Item.create({
      name,
      price: Number(price),
      category,
      foodType,
      image,
      shop: shop._id,
    });

    shop.items.push(item._id);

    await shop.save();

    await shop.populate("owner items");

    // console.log("ITEM SAVED:", item);
    // console.log("SHOP UPDATED:", shop);

    return res.status(201).json(shop);

  } catch (error) {
    // console.log("ADD FOOD ITEM ERROR:", error);

    return res.status(500).json({
      message: "Error adding food item",
      error: error.message,
    });
  }
};

export const getShopByCity = async (req, res) => {
  try {
    const { city } = req.params;
    const shops = await Shop.find({ city: { $regex: new RegExp(`^${city}$`, 'i') } }).populate("owner").populate({
      path: "items",
      options: { sort: { createdAt: -1 } }
    });
    return res.status(200).json(shops);
  }catch (error) {
    return res.status(500).json({
      message: "Error fetching shops by city",
      error: error.message,
    });
  }
};
