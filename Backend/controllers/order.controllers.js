import Shop from "../models/shop.model.js";
import Order from "../models/order.model.js";
import crypto from "crypto";
import razorpay from "../config/razorpay.js";
import Item from "../models/item.model.js";
import User from "../models/user.model.js";
import { sendDeliveryOtpEmail } from "../utils/mail.js";
import DeliveryAssignment from "../models/deliveryAssignment.model.js";
export const placeOrder = async (req, res) => {
  try {
    const { cartItems, paymentMethod, deliveryAddress } = req.body;
    // console.log("CART ITEMS:", JSON.stringify(cartItems, null, 2));
    if (!Array.isArray(cartItems) || cartItems.length == 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }
    if (
      !deliveryAddress?.text ||
      deliveryAddress?.latitude == null ||
      deliveryAddress?.longitude == null
    ) {
      return res.status(400).json({
        message:
          "Please provide a valid delivery address with location details.",
      });
    }
    const groupItemsByShop = {};
    cartItems.forEach((item) => {
      const shopId = item.shop;
      if (!groupItemsByShop[shopId]) {
        groupItemsByShop[shopId] = [];
      }
      groupItemsByShop[shopId].push(item);
    });
    const shopOrder = await Promise.all(
      Object.keys(groupItemsByShop).map(async (shopId) => {
        const shop = await Shop.findById(shopId).populate("owner");
        if (!shop) {
          throw new Error(`Shop with ID ${shopId} not found`);
        }
        const items = groupItemsByShop[shopId];
        const subTotal = items.reduce(
          (sum, i) => sum + Number(i.price) * Number(i.quantity),
          0,
        );
        return {
          shop: shop._id,
          owner: shop.owner._id,
          shopOrderItems: items.map((i) => ({
            item: i.id,
            price: i.price,
            quantity: i.quantity,
            name: i.name,
          })),
          subTotal,
        };
      }),
    );
    const totalAmount = shopOrder.reduce(
      (sum, order) => sum + order.subTotal,
      0,
    );
    const order = await Order.create({
      user: req.user._id,
      paymentMethod,
      deliveryAddress,
      totalAmount,
      shopOrder,
    });
    return res.status(201).json({
      message: "Order placed successfully!",
      order,
    });
  } catch (error) {
    console.error("PLACE ORDER ERROR:", error);
    return res
      .status(500)
      .json({ message: "Something went wrong while placing your order." });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    })
      .populate("shopOrder.shop", "name image address")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Orders fetched successfully",
      orders,
    });
  } catch (error) {
    console.error("GET MY ORDERS ERROR:", error);

    return res.status(500).json({
      message: "Unable to fetch orders",
    });
  }
};

export const getOwnerOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      "shopOrder.owner": req.user._id,
    })
      .populate("user", "fullName name email mobile")
      .populate("shopOrder.shop", "name image address")
      .sort({ createdAt: -1 });

    const ownerOrders = orders
      .map((order) => {
        const ownerShopOrders = order.shopOrder.filter(
          (shopOrder) =>
            shopOrder.owner?.toString() === req.user._id.toString(),
        );

        return {
          ...order.toObject(),
          shopOrder: ownerShopOrders,
        };
      })
      .filter((order) => order.shopOrder.length > 0);

    return res.status(200).json({
      message: "Owner orders fetched successfully",
      orders: ownerOrders,
    });
  } catch (error) {
    console.error("GET OWNER ORDERS ERROR:", error);

    return res.status(500).json({
      message: "Unable to fetch orders",
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  let createdAssignment = null;

  try {
    const { orderId, shopOrderId } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Preparing",
      "Out for Delivery",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      "shopOrder._id": shopOrderId,
      "shopOrder.owner": req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found or you are not authorized",
      });
    }

    const shopOrder = order.shopOrder.id(shopOrderId);

    if (!shopOrder) {
      return res.status(404).json({
        message: "Shop order not found",
      });
    }

    const previousStatus = shopOrder.status;

    // ----------------------------------
    // STEP 1: Handle Out for Delivery
    // ----------------------------------

    if (
      status === "Out for Delivery" &&
      !shopOrder.assignment
    ) {
      const { longitude, latitude } = order.deliveryAddress;

      const nearByDeliveryBoys = await User.find({
        role: "deliveryBoy",
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [
                Number(longitude),
                Number(latitude),
              ],
            },
            $maxDistance: 5000,
          },
        },
      });

      const nearByIds = nearByDeliveryBoys.map(
        (boy) => boy._id
      );

      const busyIds = await DeliveryAssignment.find({
        assignedTo: { $in: nearByIds },
        status: { $nin: ["broadcasted", "completed"] },
      }).distinct("assignedTo");

      const busyIdSet = new Set(
        busyIds.map((id) => String(id))
      );

      const availableBoys = nearByDeliveryBoys.filter(
        (boy) => !busyIdSet.has(String(boy._id))
      );

      const candidates = availableBoys.map(
        (boy) => boy._id
      );

      // No delivery partners available
      if (candidates.length === 0) {
        return res.status(200).json({
          message:
            "No delivery partners available within your area. Please try again later.",
          status: previousStatus,
          availableBoys: [],
          assignment: null,
        });
      }

      // Create delivery assignment
      createdAssignment = await DeliveryAssignment.create({
        order: order._id,
        shop: shopOrder.shop,
        shopOrderId: shopOrder._id,
        broadcastedTo: candidates,
        status: "broadcasted",
      });

      shopOrder.assignment = createdAssignment._id;

      // ----------------------------------
      // STEP 2: Generate 6-digit OTP
      // ----------------------------------

      const otp = crypto
        .randomInt(100000, 1000000)
        .toString();

      shopOrder.deliveryOtp = otp;

      shopOrder.deliveryOtpHash = crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");

      shopOrder.deliveryOtpExpiresAt = new Date(
        Date.now() + 10 * 60 * 1000
      );

      shopOrder.deliveryOtpVerifiedAt = null;

      shopOrder.status = "Out for Delivery";

      // ----------------------------------
      // STEP 3: Save order
      // ----------------------------------

      await order.save();

      // ----------------------------------
      // STEP 4: Get customer's email
      // ----------------------------------

      const customer = await User.findById(order.user)
        .select("email");

      if (!customer || !customer.email) {
        throw new Error(
          "Customer email not found. Unable to send delivery OTP."
        );
      }

      // ----------------------------------
      // STEP 5: Send OTP email
      // ----------------------------------

      await sendDeliveryOtpEmail(
        customer.email,
        otp
      );

      console.log(
        "Delivery OTP email sent to customer:",
        customer.email
      );

      const deliveryBoyPayload = availableBoys.map(
        (boy) => ({
          id: boy._id,
          fullName: boy.fullName,
          longitude: boy.location.coordinates?.[0],
          latitude: boy.location.coordinates?.[1],
          mobile: boy.mobile,
        })
      );

      await order.populate(
        "shopOrder.shop",
        "name"
      );

      await order.populate(
        "shopOrder.assignedDeliveryBoy",
        "fullName email mobile"
      );

      const updatedShopOrder = order.shopOrder.id(
        shopOrderId
      );

      return res.status(200).json({
        message:
          "Order is out for delivery. OTP sent to the customer's email.",
        shopOrder: updatedShopOrder,
        status: updatedShopOrder.status,
        assignedDeliveryBoy:
          updatedShopOrder.assignedDeliveryBoy,
        availableBoys: deliveryBoyPayload,
        assignment: updatedShopOrder.assignment,
      });
    }

    // ----------------------------------
    // STEP 6: Handle other status changes
    // ----------------------------------

    shopOrder.status = status;

    await order.save();

    await order.populate(
      "shopOrder.shop",
      "name"
    );

    await order.populate(
      "shopOrder.assignedDeliveryBoy",
      "fullName email mobile"
    );

    const updatedShopOrder = order.shopOrder.id(
      shopOrderId
    );

    return res.status(200).json({
      message: "Order status updated successfully",
      shopOrder: updatedShopOrder,
      status: updatedShopOrder.status,
      assignedDeliveryBoy:
        updatedShopOrder.assignedDeliveryBoy,
      availableBoys: [],
      assignment: updatedShopOrder.assignment,
    });
  } catch (error) {
    console.error("UPDATE ORDER STATUS ERROR:", error);

    // ----------------------------------
    // STEP 7: Roll back if email/creation fails
    // ----------------------------------

    if (createdAssignment) {
      try {
        await DeliveryAssignment.findByIdAndDelete(
          createdAssignment._id
        );

        const rollbackOrder = await Order.findById(
          createdAssignment.order
        );

        if (rollbackOrder) {
          const rollbackShopOrder = rollbackOrder.shopOrder.id(
            createdAssignment.shopOrderId
          );

          if (
            rollbackShopOrder &&
            String(rollbackShopOrder.assignment) ===
              String(createdAssignment._id)
          ) {
            rollbackShopOrder.assignment = null;
            rollbackShopOrder.assignedDeliveryBoy = null;
            rollbackShopOrder.status = "Preparing";
            rollbackShopOrder.deliveryOtp = null;
            rollbackShopOrder.deliveryOtpHash = null;
            rollbackShopOrder.deliveryOtpExpiresAt = null;
            rollbackShopOrder.deliveryOtpVerifiedAt = null;

            await rollbackOrder.save();
          }
        }
      } catch (rollbackError) {
        console.error(
          "DELIVERY OTP ROLLBACK ERROR:",
          rollbackError
        );
      }
    }

    return res.status(500).json({
      message:
        "Unable to update order status or send delivery OTP. Please try again.",
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

    const shopOrder = order.shopOrder.id(assignment.shopOrderId);

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

    if (shopOrder.deliveryOtpExpiresAt.getTime() < Date.now()) {
      return res.status(400).json({
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    const submittedHash = crypto
      .createHash("sha256")
      .update(String(otp))
      .digest("hex");

    const submittedBuffer = Buffer.from(submittedHash, "hex");
    const storedBuffer = Buffer.from(shopOrder.deliveryOtpHash, "hex");

    if (
      submittedBuffer.length !== storedBuffer.length ||
      !crypto.timingSafeEqual(submittedBuffer, storedBuffer)
    ) {
      return res.status(400).json({
        message: "Incorrect OTP. Please try again.",
      });
    }

    shopOrder.status = "Delivered";
    shopOrder.deliveryOtpVerifiedAt = new Date();

    // Clear OTP values after successful verification
    shopOrder.deliveryOtp = null;
    shopOrder.deliveryOtpHash = null;
    shopOrder.deliveryOtpExpiresAt = null;

    assignment.status = "completed";

    await Promise.all([order.save(), assignment.save()]);

    return res.status(200).json({
      message: "OTP verified successfully. Order marked as delivered!",
      status: shopOrder.status,
    });
  } catch (error) {
    console.error("VERIFY DELIVERY OTP ERROR:", error);

    return res.status(500).json({
      message: "Unable to verify delivery OTP.",
    });
  }
};

// Create Razorpay Payment Order
export const createRazorpayOrder = async (req, res) => {
  try {
    const { cartItems, deliveryAddress } = req.body;

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    if (
      !deliveryAddress?.text ||
      deliveryAddress?.latitude == null ||
      deliveryAddress?.longitude == null
    ) {
      return res.status(400).json({
        message: "Please provide a valid delivery address.",
      });
    }

    // Validate cart using database prices, not frontend prices
    let totalAmount = 0;
    const groupedItems = {};

    for (const cartItem of cartItems) {
      const itemId = cartItem.id || cartItem._id;
      const quantity = Number(cartItem.quantity);

      if (!itemId || !Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({
          message: "Invalid cart item or quantity.",
        });
      }

      const dbItem = await Item.findById(itemId);

      if (!dbItem) {
        return res.status(400).json({
          message: "A cart item could not be found.",
        });
      }

      const shopId = String(dbItem.shop);

      if (!groupedItems[shopId]) {
        groupedItems[shopId] = [];
      }

      groupedItems[shopId].push({
        item: dbItem,
        quantity,
      });

      totalAmount += Number(dbItem.price) * quantity;
    }

    // Match checkout delivery-fee rule
    const deliveryFee =
      totalAmount > 0 && totalAmount + 40 <= 500 ? 40 : 0;

    totalAmount += deliveryFee;

    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      return res.status(400).json({
        message: "Invalid payment amount.",
      });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: `vingo_${Date.now()}`,
      notes: {
        userId: String(req.user._id),
      },
    });

    return res.status(200).json({
      message: "Payment order created successfully",
      keyId: process.env.RAZORPAY_KEY_ID,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error) {
    console.error("CREATE RAZORPAY ORDER ERROR:", error);

    return res.status(500).json({
      message: "Unable to initialize payment. Please try again.",
    });
  }
};


// Verify Razorpay Payment
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      cartItems,
      deliveryAddress,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        message: "Payment verification details are missing.",
      });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const received = Buffer.from(razorpay_signature, "hex");
    const expected = Buffer.from(expectedSignature, "hex");

    if (
      received.length !== expected.length ||
      !crypto.timingSafeEqual(received, expected)
    ) {
      return res.status(400).json({
        message: "Payment signature verification failed.",
      });
    }

    // Fetch payment from Razorpay and verify its status and amount
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    if (
      payment.order_id !== razorpay_order_id ||
      payment.status !== "captured" ||
      payment.currency !== "INR"
    ) {
      return res.status(400).json({
        message: "Payment is not successfully captured.",
      });
    }

    // Prevent reusing a payment ID to create another order
    const existingOrder = await Order.findOne({
      razorpayPaymentId: razorpay_payment_id,
    });

    if (existingOrder) {
      if (String(existingOrder.user) !== String(req.user._id)) {
        return res.status(409).json({
          message: "This payment has already been used.",
        });
      }

      return res.status(200).json({
        message: "Payment already verified.",
        order: existingOrder,
      });
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({
        message: "Cart is empty.",
      });
    }

    if (
      !deliveryAddress?.text ||
      deliveryAddress?.latitude == null ||
      deliveryAddress?.longitude == null
    ) {
      return res.status(400).json({
        message: "Please provide a valid delivery address.",
      });
    }

    const groupedItems = {};

    for (const cartItem of cartItems) {
      const itemId = cartItem.id || cartItem._id;
      const quantity = Number(cartItem.quantity);

      if (!itemId || !Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({
          message: "Invalid cart item or quantity.",
        });
      }

      const dbItem = await Item.findById(itemId);

      if (!dbItem) {
        return res.status(400).json({
          message: "A cart item could not be found.",
        });
      }

      const shopId = String(dbItem.shop);

      if (!groupedItems[shopId]) {
        groupedItems[shopId] = [];
      }

      groupedItems[shopId].push({
        item: dbItem,
        quantity,
      });
    }

    const shopOrder = await Promise.all(
      Object.entries(groupedItems).map(async ([shopId, items]) => {
        const shop = await Shop.findById(shopId).populate("owner");

        if (!shop || !shop.owner) {
          throw new Error("Shop or shop owner not found.");
        }

        const shopItems = items.map(({ item, quantity }) => ({
          item: item._id,
          name: item.name,
          price: Number(item.price),
          quantity,
        }));

        const subTotal = shopItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        return {
          shop: shop._id,
          owner: shop.owner._id,
          shopOrderItems: shopItems,
          subTotal,
        };
      })
    );

    const subtotal = shopOrder.reduce(
      (sum, shop) => sum + shop.subTotal,
      0
    );

    const deliveryFee =
      subtotal > 0 && subtotal + 40 <= 500 ? 40 : 0;

    const totalAmount = subtotal + deliveryFee;

    // Confirm the amount against the Razorpay order and payment
    const razorpayOrder = await razorpay.orders.fetch(razorpay_order_id);

    if (
      String(razorpayOrder.receipt || "").length === 0 ||
      razorpayOrder.status !== "paid" ||
      Number(razorpayOrder.amount) !== Math.round(totalAmount * 100) ||
      Number(payment.amount) !== Math.round(totalAmount * 100)
    ) {
      return res.status(400).json({
        message: "Payment amount does not match the order total.",
      });
    }

    const order = await Order.create({
      user: req.user._id,
      paymentMethod: "online",
      paymentStatus: "Paid",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      deliveryAddress,
      totalAmount,
      shopOrder,
    });

    return res.status(201).json({
      message: "Payment verified and order placed successfully!",
      order,
    });
  } catch (error) {
    console.error("VERIFY RAZORPAY PAYMENT ERROR:", error);

    return res.status(500).json({
      message: "Unable to verify payment and place order.",
    });
  }
};