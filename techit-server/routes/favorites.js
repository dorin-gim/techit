const express = require("express");
const mongoose = require("mongoose");
const Favorite = require("../models/Favorite");
const Product = require("../models/Product");
const auth = require("../middlewares/auth");
const { adminLimiter } = require("../middlewares/rateLimiter");
const Joi = require("joi");
const router = express.Router();

// Validation schema
const favoriteSchema = Joi.object({
  productId: Joi.string().required()
});

// Get all user favorites with product details
router.get("/", auth, async (req, res) => {
  try {
    console.log("Getting favorites for user:", req.payload._id);
    
    const favorites = await Favorite.find({ 
      userId: new mongoose.Types.ObjectId(req.payload._id) 
    });
    
    console.log("Found favorites:", favorites.length);
    
    // Get product details for each favorite
    const productPromises = favorites.map(fav => 
      Product.findById(fav.productId)
    );
    
    const products = await Promise.all(productPromises);
    
    // Filter out null products (in case product was deleted)
    const validProducts = products
      .filter(product => product !== null)
      .map(product => product.toObject());
    
    console.log("Valid products:", validProducts.length);
    res.status(200).send(validProducts);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(400).send("שגיאה בטעינת המועדפים");
  }
});

// Add product to favorites
router.post("/", auth, async (req, res) => {
  try {
    console.log("Adding to favorites - User:", req.payload._id, "Product:", req.body.productId);
    
    // Validate request body
    const { error } = favoriteSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // Check if product exists and is valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.body.productId)) {
      return res.status(400).send("מזהה מוצר לא תקין");
    }

    const product = await Product.findById(req.body.productId);
    if (!product) return res.status(404).send("המוצר לא נמצא");

    // Check if already in favorites
    const existingFavorite = await Favorite.findOne({
      userId: new mongoose.Types.ObjectId(req.payload._id),
      productId: new mongoose.Types.ObjectId(req.body.productId)
    });
    
    if (existingFavorite) {
      return res.status(400).send("המוצר כבר במועדפים");
    }

    // Add to favorites
    const favorite = new Favorite({
      userId: new mongoose.Types.ObjectId(req.payload._id),
      productId: new mongoose.Types.ObjectId(req.body.productId)
    });
    
    await favorite.save();
    console.log("Favorite saved successfully:", favorite);
    res.status(201).send("המוצר נוסף למועדפים בהצלחה");
  } catch (error) {
    console.error("Error adding to favorites:", error);
    res.status(400).send("שגיאה בהוספה למועדפים");
  }
});

// Remove product from favorites
router.delete("/:productId", auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.productId)) {
      return res.status(400).send("מזהה מוצר לא תקין");
    }

    const favorite = await Favorite.findOneAndDelete({
      userId: new mongoose.Types.ObjectId(req.payload._id),
      productId: new mongoose.Types.ObjectId(req.params.productId)
    });

    if (!favorite) {
      return res.status(404).send("המוצר לא נמצא במועדפים");
    }

    res.status(200).send("המוצר הוסר מהמועדפים בהצלחה");
  } catch (error) {
    console.error("Error removing from favorites:", error);
    res.status(400).send("שגיאה בהסרה מהמועדפים");
  }
});

// Check if product is in user's favorites
router.get("/check/:productId", auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.productId)) {
      return res.status(400).send("מזהה מוצר לא תקין");
    }

    const favorite = await Favorite.findOne({
      userId: new mongoose.Types.ObjectId(req.payload._id),
      productId: new mongoose.Types.ObjectId(req.params.productId)
    });

    res.status(200).send({ isFavorite: !!favorite });
  } catch (error) {
    console.error("Error checking favorite:", error);
    res.status(400).send("שגיאה בבדיקת מועדפים");
  }
});

// Get favorites statistics for admin
router.get("/stats", auth, adminLimiter, async (req, res) => {
  try {
    console.log("Stats route called by user:", req.payload._id, "isAdmin:", req.payload.isAdmin);
    
    if (!req.payload.isAdmin) {
      return res.status(403).send("אין הרשאה לצפייה בנתונים");
    }

    // בדיקה פשוטה קודם
    const favoritesCount = await Favorite.countDocuments();
    console.log("Total favorites in DB:", favoritesCount);
    
    if (favoritesCount === 0) {
      return res.status(200).send([]);
    }

    // בדיקה מפורטת של המסמכים
    const allFavorites = await Favorite.find().limit(5);
    console.log("Sample favorites:", allFavorites);

    // Aggregation pipeline מעודכן
    const pipeline = [
      {
        $group: {
          _id: "$productId",
          favoriteCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "products", // שם הקולקשן במונגו
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      {
        $unwind: {
          path: "$product",
          preserveNullAndEmptyArrays: false // מסנן מוצרים שנמחקו
        }
      },
      {
        $project: {
          _id: 1,
          productName: "$product.name",
          productCategory: "$product.category",
          favoriteCount: 1
        }
      },
      {
        $sort: { favoriteCount: -1 }
      }
    ];

    console.log("Running aggregation pipeline...");
    const stats = await Favorite.aggregate(pipeline);
    console.log("Aggregation result:", JSON.stringify(stats, null, 2));
    
    res.status(200).send(stats);
  } catch (error) {
    console.error("Error fetching favorites stats:", error);
    console.error("Stack trace:", error.stack);
    res.status(400).send("שגיאה בטעינת סטטיסטיקות: " + error.message);
  }
});

module.exports = router;