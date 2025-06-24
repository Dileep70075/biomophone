import express from "express";
import authRoutes from "./routes/auth.route.js";
import eventRoutes from "./routes/event.js";
import marketplace from "./routes/marketplace.js";
import storyRoutes from "./routes/story.js";
import userRoutes from "./routes/users.js";
import profileRoutes from "./routes/Profile.js";
import communityRoutes from "./routes/Community.js";
import postRoutes from "./routes/posts.route.js";
import commentRoutes from "./routes/comments.js";
import likeRoutes from "./routes/likes.js";
import relationshipRoutes from "./routes/relationships.js";
import cors from "cors";
import multer from "multer";
import cookieParser from "cookie-parser";
import authenticateJWT from "./middleware/tokenVerify.js";
import bodyParser from "body-parser";
// import Stripe from "stripe";
import paymentRoutes from "./routes/payment.js";
import friendRequests from "./routes/request.js";
import tipRoutes from "./routes/tipRoutes.js";
import subscriptionRoutes from "./routes/subcription.js";
import dotenv from "dotenv";
import { connectToDb } from "./utils/db.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config({
  path: ".env",
});



const app = express();
// app.use(express.json());
app.use(express.static("uploads"));
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", true);
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("uploads"));
app.use("/uploads", express.static("uploads"));
app.use((req, res, next) => {
  console.log(
    `Incoming Request: ${req.method} ${req.url} from ${req.headers.origin}`
  );
  next();
});

const allowedOrigins = [
  "https://f2cc-49-42-32-199.ngrok-free.app",
  "http://localhost:3000",
  "https://biomophone.com",
  "https://serverapi.biomophone.com",
  "https://dev.biomophone.com",
  "http://dev.biomophone.com",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, origin);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);
// app.use(cors({ origin: '*' }));

app.use("/api/auth", authRoutes);
app.use("/api/marketplaceController", marketplace);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
// app.use("/api/images", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/relationships", relationshipRoutes);
app.use("/api/communities", communityRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/tips", tipRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/requests", friendRequests);


app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectToDb();
    console.log("Database connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting the server: ", error);
  }
};

startServer();

// API Endpoints
// app.post("/api/upload", upload.single("file"), (req, res) => {
//   const file = req.file;
//   res.status(200).json(file.filename);
// });

// app.post("/api/users/upgrade", async (req, res) => {
//   try {
//     const { userId } = req.body;

//     // Find user and update premium status
//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ error: "User not found" });

//     user.isPremium = true;
//     await user.save();

//     res.status(200).json({ isPremium: true });
//   } catch (error) {
//     console.error("Error upgrading user:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// app.post("/api/create-checkout-session", async (req, res) => {
//   try {
//     const { userId, plan } = req.body;

//     if (!subscriptionPlans[plan]) {
//       return res.status(400).json({ message: "Invalid subscription plan." });
//     }

//     try {
//       const session = await stripe.checkout.sessions.create({
//         payment_method_types: ["card"],
//         line_items: [
//           {
//             price_data: {
//               currency: "usd",
//               product_data: {
//                 name: plan,
//               },
//               unit_amount: subscriptionPlans[plan].price * 100,
//             },
//             quantity: 1,
//           },
//         ],
//         mode: "payment",
//         success_url: "http://localhost:3000/success",
//         cancel_url: "http://localhost:3000/cancel",
//       });

//       res.json({ id: session.id });
//     } catch (error) {
//       console.error("Stripe session creation error:", error);
//       res
//         .status(500)
//         .json({ message: "Failed to create checkout session.", error });
//     }

//     const { price } = subscriptionPlans[plan];
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       line_items: [
//         {
//           price_data: {
//             currency: "usd",
//             product_data: {
//               name: `${plan} Subscription`,
//             },
//             unit_amount: price * 100, // Price in cents
//           },
//           quantity: 1,
//         },
//       ],
//       mode: "payment",
//       success_url:
//         "http:///success?session_id={CHECKOUT_SESSION_ID}",
//       cancel_url: "http://localhost:3000/cancel",
//     });

//     res.json({ id: session.id });
//   } catch (error) {
//     console.error("Stripe session creation error:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// app.post(
//   "/webhook",
//   express.raw({ type: "application/json" }),
//   async (req, res) => {
//     const endpointSecret = "your_webhook_secret";
//     const sig = req.headers["stripe-signature"];

//     let event;
//     try {
//       event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
//     } catch (err) {
//       console.error("Webhook error:", err.message);
//       return res.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     if (event.type === "checkout.session.completed") {
//       const session = event.data.object;
//       const { client_reference_id: userId, metadata } = session;

//       // Update the user's subscription in the database
//       const plan = metadata.plan; // Assuming you pass this in metadata during session creation
//       await prisma.subscription.update({
//         where: { userId },
//         data: {
//           isActive: true,
//           startDate: new Date(),
//           endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
//         },
//       });
//       await prisma.user.update({
//         where: { id: userId },
//         data: { isPremium: true },
//       });
//     }

//     res.status(200).json({ received: true });
//   }
// );

// Route Handlers
