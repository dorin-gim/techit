const express = require("express");
const Favorite = require("../models/Favorite");
const Product = require("../models/Product");
const auth = require("../middlewares/auth");
const Joi = require("joi");
const router = express.Router();

// Validation schema
const favoriteSchema = Joi.object({
  productId: Joi.string().required()
});

// Get all user favorites with product details
router.get("/", auth, async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.payload._id });
    
    // Get product details for each favorite
    const productPromises = favorites.map(fav => 
      Product.findById(fav.productId)
    );
    
    const products = await Promise.all(productPromises);
    
    // Filter out null products (in case product was deleted)
    const validProducts = products
      .filter(product => product !== null)
      .map(product => product.toObject());
    
    res.status(200).send(validProducts);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(400).send("שגיאה בטעינת המועדפים");
  }
});

// Add product to favorites
router.post("/", auth, async (req, res) => {
  try {
    // Validate request body
    const { error } = favoriteSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // Check if product exists
    const product = await Product.findById(req.body.productId);
    if (!product) return res.status(404).send("המוצר לא נמצא");

    // Check if already in favorites
    const existingFavorite = await Favorite.findOne({
      userId: req.payload._id,
      productId: req.body.productId
    });
    
    if (existingFavorite) {
      return res.status(400).send("המוצר כבר במועדפים");
    }

    // Add to favorites
    const favorite = new Favorite({
      userId: req.payload._id,
      productId: req.body.productId
    });
    
    await favorite.save();
    res.status(201).send("המוצר נוסף למועדפים בהצלחה");
  } catch (error) {
    console.error("Error adding to favorites:", error);
    res.status(400).send("שגיאה בהוספה למועדפים");
  }
});

// Remove product from favorites
router.delete("/:productId", auth, async (req, res) => {
  try {
    const favorite = await Favorite.findOneAndDelete({
      userId: req.payload._id,
      productId: req.params.productId
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
    const favorite = await Favorite.findOne({
      userId: req.payload._id,
      productId: req.params.productId
    });

    res.status(200).send({ isFavorite: !!favorite });
  } catch (error) {
    console.error("Error checking favorite:", error);
    res.status(400).send("שגיאה בבדיקת מועדפים");
  }
});

// Get favorites count for admin (bonus feature)
router.get("/stats", auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.payload.isAdmin) {
      return res.status(403).send("אין הרשאה לצפייה בנתונים");
    }

    const pipeline = [
      {
        $group: {
          _id: "$productId",
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      {
        $unwind: "$product"
      },
      {
        $project: {
          productName: "$product.name",
          productCategory: "$product.category",
          favoriteCount: "$count"
        }
      },
      {
        $sort: { favoriteCount: -1 }
      }
    ];

    const stats = await Favorite.aggregate(pipeline);
    res.status(200).send(stats);
  } catch (error) {
    console.error("Error fetching favorites stats:", error);
    res.status(400).send("שגיאה בטעינת סטטיסטיקות");
  }
});

module.exports = router;