import Order from "../models/order.model.js";
import { createHash, timingSafeEqual } from "node:crypto";
import DeliveryAssignment from "../models/deliveryAssignment.model.js";

export const getAvailableOrders = async (req, res) => {
  try {
    const deliveryBoyId = req.user._id;

    const assignments = await DeliveryAssignment.find({
      broadcastedTo: deliveryBoyId,
      status: "broadcasted",
    })
      .populate("order")
      .populate("shop", "name address image")
      .sort({ createdAt: -1 });

    const orders = assignments
      .filter((assignment) => assignment.order)
      .map((assignment) => {
        const order = assignment.order;

        const shopOrder = order.shopOrder?.find(
          (item) =>
            item._id.toString() ===
            assignment.shopOrderId.toString()
        );

        if (!shopOrder) {
          return null;
        }

        return {
          _id: assignment._id,
          assignmentId: assignment._id,
          orderId: order._id,
          shop: assignment.shop,
          shopName: assignment.shop?.name || "Restaurant",
          shopAddress: assignment.shop?.address || "",
          deliveryAddress: order.deliveryAddress,
          totalAmount: order.totalAmount,
          subTotal: shopOrder.subTotal,
          items: shopOrder.shopOrderItems,
          createdAt: assignment.createdAt,
        };
      })
      .filter(Boolean);

    return res.status(200).json({
      message: "Available orders fetched successfully",
      orders,
    });
  } catch (error) {
    console.error("GET AVAILABLE ORDERS ERROR:", error);

    return res.status(500).json({
      message: "Unable to fetch available orders",
    });
  }
};

export const acceptOrder = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const deliveryBoyId = req.user._id;

    const assignment = await DeliveryAssignment.findOneAndUpdate(
      {
        _id: assignmentId,
        broadcastedTo: deliveryBoyId,
        status: "broadcasted",
        assignedTo: null,
      },
      {
        $set: {
          assignedTo: deliveryBoyId,
          status: "assigned",
          acceptedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!assignment) {
      return res.status(409).json({
        message:
          "This order is no longer available or has already been accepted.",
      });
    }

    const order = await Order.findOne({
      _id: assignment.order,
      "shopOrder._id": assignment.shopOrderId,
    });

    if (!order) {
      await DeliveryAssignment.updateOne(
        {
          _id: assignment._id,
          assignedTo: deliveryBoyId,
        },
        {
          $set: {
            assignedTo: null,
            status: "broadcasted",
          },
          $unset: {
            acceptedAt: 1,
          },
        }
      );

      return res.status(404).json({
        message: "Order not found.",
      });
    }

    const shopOrder = order.shopOrder.id(
      assignment.shopOrderId
    );

    if (!shopOrder) {
      return res.status(404).json({
        message: "Shop order not found.",
      });
    }

    shopOrder.assignedDeliveryBoy = deliveryBoyId;
    shopOrder.assignment = assignment._id;
    shopOrder.status = "Out for Delivery";

    await order.save();

    return res.status(200).json({
      message: "Order accepted successfully!",
      assignment,
    });
  } catch (error) {
    console.error("ACCEPT ORDER ERROR:", error);

    return res.status(500).json({
      message: "Unable to accept order.",
      error: error.message,
    });
  }
};

export const getMyAcceptedOrders = async (req, res) => {
  try {
    const deliveryBoyId = req.user._id;

    const assignments = await DeliveryAssignment.find({
      assignedTo: deliveryBoyId,
      status: "assigned",
    })
      .populate("order")
      .populate("shop", "name address image")
      .sort({ updatedAt: -1 });

    const orders = assignments
      .filter((assignment) => assignment.order)
      .map((assignment) => {
        const order = assignment.order;

        const shopOrder = order.shopOrder?.find(
          (item) =>
            String(item._id) ===
            String(assignment.shopOrderId)
        );

        if (!shopOrder) return null;

        return {
          assignmentId: assignment._id,
          orderId: order._id,
          shopName: assignment.shop?.name || "Restaurant",
          shopAddress: assignment.shop?.address || "",
          deliveryAddress: order.deliveryAddress,
          totalAmount: order.totalAmount,
          subTotal: shopOrder.subTotal,
          status: shopOrder.status,
          items: shopOrder.shopOrderItems,
          acceptedAt: assignment.acceptedAt,
        };
      })
      .filter(Boolean);

    return res.status(200).json({
      message: "Accepted orders fetched successfully",
      orders,
    });
  } catch (error) {
    console.error("GET MY ACCEPTED ORDERS ERROR:", error);

    return res.status(500).json({
      message: "Unable to fetch accepted orders",
    });
  }
};
export const verifyDeliveryOtp = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { otp } = req.body;
    const deliveryBoyId = req.user._id;

    if (!/^\d{6}$/.test(String(otp || ""))) {
      return res.status(400).json({
        message: "Please enter a valid 6-digit OTP.",
      });
    }

    const assignment = await DeliveryAssignment.findOne({
      _id: assignmentId,
      assignedTo: deliveryBoyId,
      status: "assigned",
    });

    if (!assignment) {
      return res.status(404).json({
        message: "Assigned delivery order not found.",
      });
    }

    const order = await Order.findOne({
      _id: assignment.order,
      "shopOrder._id": assignment.shopOrderId,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    const shopOrder = order.shopOrder.id(
      assignment.shopOrderId
    );

    if (!shopOrder) {
      return res.status(404).json({
        message: "Shop order not found.",
      });
    }

    if (shopOrder.status === "Delivered") {
      return res.status(400).json({
        message: "This order has already been delivered.",
      });
    }

    if (shopOrder.status !== "Out for Delivery") {
      return res.status(400).json({
        message: "This order is not out for delivery.",
      });
    }

    if (
      !shopOrder.deliveryOtpHash ||
      !shopOrder.deliveryOtpExpiresAt
    ) {
      return res.status(400).json({
        message: "Delivery OTP has not been generated.",
      });
    }

    if (
      shopOrder.deliveryOtpExpiresAt.getTime() <
      Date.now()
    ) {
      return res.status(400).json({
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    const submittedHash = createHash("sha256")
      .update(String(otp))
      .digest("hex");

    const submittedBuffer = Buffer.from(
      submittedHash,
      "hex"
    );

    const storedBuffer = Buffer.from(
      shopOrder.deliveryOtpHash,
      "hex"
    );

    if (
      submittedBuffer.length !== storedBuffer.length ||
      !timingSafeEqual(submittedBuffer, storedBuffer)
    ) {
      return res.status(400).json({
        message: "Incorrect OTP. Please try again.",
      });
    }

    // Mark delivery as completed
    const completedTime = new Date();

    shopOrder.status = "Delivered";
    shopOrder.deliveryOtpVerifiedAt = completedTime;

    shopOrder.deliveryOtp = null;
    shopOrder.deliveryOtpHash = null;
    shopOrder.deliveryOtpExpiresAt = null;

    assignment.status = "completed";
    assignment.completedAt = completedTime;

    const io = req.app.get("io");

    if (io) {
      const customerId = String(order.user);
      const customerRoom = `customer:${customerId}`;

      io.to(customerRoom).emit("delivery-completed", {
        orderId: String(order._id),
        assignmentId: String(assignment._id),
        shopOrderId: String(assignment.shopOrderId),
        status: "Delivered",
        message: "Your order has been delivered successfully!",
      });

      console.log("DELIVERY COMPLETED EVENT EMITTED:", {
        customerRoom,
        orderId: String(order._id),
        assignmentId: String(assignment._id),
      });
    }

    await Promise.all([
      order.save(),
      assignment.save(),
    ]);

    return res.status(200).json({
      message: "OTP verified successfully. Order marked as delivered!",
      status: "Delivered",
    });
  } catch (error) {
    console.error("VERIFY DELIVERY OTP ERROR:", error);

    return res.status(500).json({
      message: "Unable to verify delivery OTP.",
    });
  }
};

// Update delivery boy's live location
export const updateDeliveryLocation = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { latitude, longitude } = req.body;
    const deliveryBoyId = req.user._id;

    console.log(
      "\n========== DELIVERY LOCATION UPDATE =========="
    );

    console.log("Assignment ID:", assignmentId);
    console.log("Delivery Boy ID:", String(deliveryBoyId));
    console.log("Received coordinates:", {
      latitude,
      longitude,
    });

    // Validate coordinates
    if (
      latitude === undefined ||
      latitude === null ||
      latitude === "" ||
      longitude === undefined ||
      longitude === null ||
      longitude === "" ||
      !Number.isFinite(Number(latitude)) ||
      !Number.isFinite(Number(longitude)) ||
      Number(latitude) < -90 ||
      Number(latitude) > 90 ||
      Number(longitude) < -180 ||
      Number(longitude) > 180
    ) {
      return res.status(400).json({
        message: "Invalid location coordinates",
      });
    }

    // Find active assignment
    const assignment = await DeliveryAssignment.findOne({
      _id: assignmentId,
      assignedTo: deliveryBoyId,
      status: "assigned",
    });

    if (!assignment) {
      console.log("Active delivery assignment not found.");

      return res.status(404).json({
        message: "Active delivery assignment not found",
      });
    }

    // Save latest delivery boy location
    assignment.deliveryBoyLocation = {
      latitude: Number(latitude),
      longitude: Number(longitude),
      updatedAt: new Date(),
    };

    const io = req.app.get("io");

    // Broadcast latest location to tracking viewers
    if (io) {
      const locationPayload = {
        assignmentId: String(assignment._id),
        latitude: Number(latitude),
        longitude: Number(longitude),
        updatedAt: assignment.deliveryBoyLocation.updatedAt,
      };

      const orderForBroadcast = await Order.findById(
        assignment.order
      );

      if (orderForBroadcast) {
        io.to(
          `customer:${String(orderForBroadcast.user)}`
        ).emit(
          "delivery-location-updated",
          locationPayload
        );

        const shopOrder = orderForBroadcast.shopOrder.id(
          assignment.shopOrderId
        );

        if (shopOrder?.owner) {
          io.to(`owner:${String(shopOrder.owner)}`).emit(
            "delivery-location-updated",
            locationPayload
          );
        }
      }
    }

    await assignment.save();

    // Find associated order
    const order = await Order.findById(assignment.order);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Validate customer delivery coordinates
    const deliveryAddress = order.deliveryAddress;

    if (
      !deliveryAddress ||
      deliveryAddress.latitude === undefined ||
      deliveryAddress.latitude === null ||
      deliveryAddress.longitude === undefined ||
      deliveryAddress.longitude === null ||
      !Number.isFinite(Number(deliveryAddress.latitude)) ||
      !Number.isFinite(Number(deliveryAddress.longitude)) ||
      Number(deliveryAddress.latitude) < -90 ||
      Number(deliveryAddress.latitude) > 90 ||
      Number(deliveryAddress.longitude) < -180 ||
      Number(deliveryAddress.longitude) > 180
    ) {
      console.log("Invalid customer delivery coordinates.");

      return res.status(400).json({
        message: "Customer delivery coordinates are invalid",
      });
    }

    // Calculate distance using the Haversine formula
    const toRadians = (degrees) =>
      (degrees * Math.PI) / 180;

    const boyLatitude = Number(latitude);
    const boyLongitude = Number(longitude);

    const customerLatitude = Number(
      deliveryAddress.latitude
    );

    const customerLongitude = Number(
      deliveryAddress.longitude
    );

    const earthRadius = 6371000;

    const deltaLat = toRadians(
      customerLatitude - boyLatitude
    );

    const deltaLon = toRadians(
      customerLongitude - boyLongitude
    );

    const lat1 = toRadians(boyLatitude);
    const lat2 = toRadians(customerLatitude);

    const a =
      Math.sin(deltaLat / 2) ** 2 +
      Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(deltaLon / 2) ** 2;

    const distance = Math.round(
      earthRadius *
        2 *
        Math.atan2(
          Math.sqrt(a),
          Math.sqrt(Math.max(0, 1 - a))
        )
    );

    console.log("Distance from customer:", distance, "metres");
    console.log(
      "Already reached customer:",
      assignment.reachedCustomer
    );

    let reachedNotificationSent = false;

    // Check whether delivery boy is within 100 metres
    if (distance <= 100) {
      if (!assignment.reachedCustomer) {
        assignment.reachedCustomer = true;
        assignment.reachedAt = new Date();

        await assignment.save();

        console.log("Customer arrival status saved.");
      }

      const customerId = String(order.user);
      const customerRoom = `customer:${customerId}`;

      if (!io) {
        console.error("Socket.IO instance not found.");
      } else {
        const roomSize =
          io.sockets.adapter.rooms.get(customerRoom)?.size ||
          0;

        console.log("Customer ID:", customerId);
        console.log("Customer room:", customerRoom);
        console.log(
          "Connected sockets in room:",
          roomSize
        );

        if (roomSize > 0) {
          io.to(customerRoom).emit(
            "delivery-boy-reached",
            {
              orderId: String(order._id),
              assignmentId: String(assignment._id),
              message:
                "Your delivery partner has reached your location!",
            }
          );

          reachedNotificationSent = true;

          console.log(
            "ARRIVAL NOTIFICATION EMITTED SUCCESSFULLY!"
          );
        } else {
          console.log(
            "Customer socket is not connected to the expected room."
          );
        }
      }
    } else {
      console.log(
        "Delivery boy is outside the 100-metre arrival threshold."
      );
    }

    console.log(
      "==============================================\n"
    );

    return res.status(200).json({
      message: "Delivery location updated",
      distanceInMetres: distance,
      reachedCustomer: assignment.reachedCustomer,
      reachedNotificationSent,
    });
  } catch (error) {
    console.error("UPDATE DELIVERY LOCATION ERROR:", error);

    return res.status(500).json({
      message: "Unable to update delivery location",
    });
  }
};
// Calculate straight-line distance between shop and customer
const calculateDistanceInKm = (
  shopLocation,
  deliveryAddress
) => {
  const shopLat = Number(shopLocation?.latitude);
  const shopLng = Number(shopLocation?.longitude);

  const customerLat = Number(
    deliveryAddress?.latitude
  );

  const customerLng = Number(
    deliveryAddress?.longitude
  );

  const coordinates = [
    shopLat,
    shopLng,
    customerLat,
    customerLng,
  ];

  if (
    !coordinates.every(Number.isFinite) ||
    shopLocation?.latitude == null ||
    shopLocation?.longitude == null ||
    deliveryAddress?.latitude == null ||
    deliveryAddress?.longitude == null ||
    Math.abs(shopLat) > 90 ||
    Math.abs(customerLat) > 90 ||
    Math.abs(shopLng) > 180 ||
    Math.abs(customerLng) > 180
  ) {
    return null;
  }

  const toRadians = (degrees) =>
    (degrees * Math.PI) / 180;

  const deltaLat = toRadians(
    customerLat - shopLat
  );

  const deltaLng = toRadians(
    customerLng - shopLng
  );

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(shopLat)) *
      Math.cos(toRadians(customerLat)) *
      Math.sin(deltaLng / 2) ** 2;

  const safeA = Math.min(1, Math.max(0, a));

  const earthRadiusKm = 6371;

  return (
    earthRadiusKm *
    2 *
    Math.atan2(
      Math.sqrt(safeA),
      Math.sqrt(1 - safeA)
    )
  );
};

// ₹40 for every 25 km slab
const calculateDeliveryEarning = (distanceInKm) => {
  return Math.max(
    40,
    Math.ceil(distanceInKm / 25) * 40
  );
};

// Delivery partner dashboard
export const getDeliveryDashboard = async (req, res) => {
  try {
    const deliveryBoyId = req.user._id;

    const assignments = await DeliveryAssignment.find({
      assignedTo: deliveryBoyId,
      status: {
        $in: ["assigned", "completed"],
      },
    })
      .populate({
        path: "order",
        select: "deliveryAddress shopOrder",
      })
      .populate({
        path: "shop",
        select: "name address location",
      })
      .sort({ updatedAt: -1 });

    const now = new Date();

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(
      startOfTomorrow.getDate() + 1
    );

    let todayEarnings = 0;
    let todayDeliveries = 0;
    let totalEarnings = 0;
    let completedDeliveries = 0;
    let missingLocationCount = 0;

    const deliveryHistory = [];

    for (const assignment of assignments) {
      if (!assignment.order || !assignment.shop) {
        continue;
      }

      const shopOrder = assignment.order.shopOrder?.find(
        (item) =>
          String(item._id) ===
          String(assignment.shopOrderId)
      );

      if (!shopOrder) {
        continue;
      }

      // Only completed deliveries earn money
      if (assignment.status !== "completed") {
        continue;
      }

      const completedAt =
        assignment.completedAt || assignment.updatedAt;

      if (!completedAt) {
        continue;
      }

      const distanceInKm = calculateDistanceInKm(
        assignment.shop.location,
        assignment.order.deliveryAddress
      );

      // Do not guess earnings if coordinates are missing
      const earning =
        distanceInKm === null
          ? null
          : calculateDeliveryEarning(distanceInKm);

      if (earning === null) {
        missingLocationCount++;
      } else {
        totalEarnings += earning;
      }

      completedDeliveries++;

      const completedDate = new Date(completedAt);

      const deliveredToday =
        completedDate >= startOfToday &&
        completedDate < startOfTomorrow;

      if (deliveredToday) {
        todayDeliveries++;

        if (earning !== null) {
          todayEarnings += earning;
        }
      }

      deliveryHistory.push({
        assignmentId: assignment._id,
        orderId: assignment.order._id,
        shopName: assignment.shop.name,
        deliveryAddress:
          assignment.order.deliveryAddress?.text || "",
        distanceInKm:
          distanceInKm === null
            ? null
            : Number(distanceInKm.toFixed(2)),
        earning,
        completedAt,
        status: "Delivered",
      });
    }

    const activeDeliveries = assignments.filter(
      (assignment) =>
        assignment.status === "assigned"
    ).length;

    return res.status(200).json({
      message: "Delivery dashboard fetched successfully",
      dashboard: {
        todayEarnings,
        todayDeliveries,
        activeDeliveries,
        totalEarnings,
        totalDeliveries: completedDeliveries,
        missingLocationCount,
        deliveryHistory,
      },
    });
  } catch (error) {
    console.error(
      "GET DELIVERY DASHBOARD ERROR:",
      error
    );

    return res.status(500).json({
      message: "Unable to fetch delivery dashboard",
    });
  }
};