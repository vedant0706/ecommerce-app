import mongoose from 'mongoose';
import productModel from './models/productModel.js';
import dotenv from 'dotenv';

dotenv.config();

const updateBestsellers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all products
    const products = await productModel.find({});
    
    for (let product of products) {
      // Check if they have BestSeller or bestSeller fields
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

    console.log('Updated all products!');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

updateBestsellers();