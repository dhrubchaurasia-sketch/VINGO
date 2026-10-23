import express from "express";
import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "./models/user.model.js";
import connectDb from "./config/db.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import shopRouter from "./routes/shop.routes.js";
import itemRouter from "./routes/item.routes.js";
import orderRouter from "./routes/order.routes.js";
import deliveryRouter from "./routes/delivery.routes.js";
import cors from "cors";

const app = express();
const port = process.env.PORT || 5000;

// HTTP server
const server = http.createServer(app);
const allowedOrigins = [
  "http://localhost:5173",
  "https://vingo-frontend-lydl.onrender.com",
];
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  credentials: true,
};
// Socket.IO setup
const io = new Server(server, {
  cors: {
    ...corsOptions,
    methods: ["GET", "POST"],
  },
});

// Make io accessible inside controllers through req.app.get("io")
app.set("io", io);

app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

// API routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/shop", shopRouter);
app.use("/api/items", itemRouter);
app.use("/api/order", orderRouter);
app.use("/api/delivery", deliveryRouter);

// Authenticate Socket.IO connections using the existing JWT cookie
io.use(async (socket, next) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie || "";

    const tokenCookie = cookieHeader
      .split("; ")
      .find((cookie) => cookie.startsWith("token="));

    if (!tokenCookie) {
      return next(new Error("Authentication required"));
    }

    const token = decodeURIComponent(tokenCookie.substring("token=".length));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("_id role");

    if (!user) {
      return next(new Error("User not found"));
    }

    socket.user = {
      id: user._id.toString(),
      role: user.role,
    };

    next();
  } catch (error) {
    console.error("SOCKET AUTH ERROR:", error.message);
    next(new Error("Socket authentication failed"));
  }
});

// Socket.IO connection
// Socket.IO connection
io.on("connection", async (socket) => {
  console.log(
    "Authenticated socket connected:",
    socket.id,
    "Role:",
    socket.user.role
  );

  // Customer's private room
  if (socket.user.role === "user") {
    const customerRoom = `customer:${socket.user.id}`;

    await socket.join(customerRoom);

    console.log("Customer joined room:", customerRoom);
    console.log(
      "Customer room size:",
      io.sockets.adapter.rooms.get(customerRoom)?.size || 0
    );
  }

  // Owner's private room
  if (socket.user.role === "owner") {
    const ownerRoom = `owner:${socket.user.id}`;

    await socket.join(ownerRoom);

    console.log("Owner joined room:", ownerRoom);
  }

  // Delivery boy's private room
  if (socket.user.role === "deliveryBoy") {
    const deliveryBoyRoom = `deliveryBoy:${socket.user.id}`;

    await socket.join(deliveryBoyRoom);

    console.log("Delivery boy joined room:", deliveryBoyRoom);
  }

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", socket.id, "Reason:", reason);
  });
});

// Start server
server.listen(port, async () => {
  try {
    await connectDb();
    console.log(`Server started at ${port}`);
    console.log("Socket.IO is ready");
  } catch (error) {
    console.error("Server startup error:", error);
  }
});