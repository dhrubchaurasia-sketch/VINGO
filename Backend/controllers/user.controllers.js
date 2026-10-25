import User from "../models/user.model.js";
export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.userId;
        if(!userId){
            return res.status(400).json({message:"User Id is not found"});
        }
        const user = await User.findById(userId)
        if(!user){
            return res.status(400).json({message:"User not found"});
        }
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({message:`get current user error ${error}`});
    }
}


export const updateUserLocation = async (req, res) => {
  try {
    const { lat, lon } = req.body;

    if (
      typeof lat !== "number" ||
      typeof lon !== "number" ||
      lat < -90 ||
      lat > 90 ||
      lon < -180 ||
      lon > 180
    ) {
      return res.status(400).json({
        message: "Invalid latitude or longitude",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        $set: {
          location: {
            type: "Point",
            coordinates: [lon, lat],
          },
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "Location updated successfully",
      userId: user._id,
      role: user.role,
      location: user.location,
    });
  } catch (error) {
    console.error("Location update error:", error);

    return res.status(500).json({
      message: "Failed to update location",
    });
  }
};