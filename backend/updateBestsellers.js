import mongoose from "mongoose";
import productModel from "./models/productModel.js";
import dotenv from "dotenv";

dotenv.config();

const updateBestsellers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const products = await productModel.find({});

    for (let product of products) {
      if (product.BestSeller !== undefined) {
        product.bestseller = product.BestSeller;
        delete product.BestSeller;
        await product.save();
      } else if (product.bestSeller !== undefined) {
        product.bestseller = product.bestSeller;
        delete product.bestSeller;
        await product.save();
      }
    }

    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
};

updateBestsellers();
