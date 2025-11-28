import orderModel from "../models/orderModel.js"
import userModel from "../models/userModel.js";
import Razorpay from 'razorpay';

// global variables
const currency = 'inr';
const deliveryCharge = 50;

// gateway intialize
const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})

// Placing orders using COD Method
const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;
    
    console.log("📦 Place Order - User ID:", userId);
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "User not authenticated" 
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty"
      });
    }

    if (!address) {
      return res.status(400).json({
        success: false,
        message: "Address is required"
      });
    }
    
    const orderData = {
      userId: userId,
      items: items,
      amount: amount,
      address: address,
      status: "Order Placed",
      paymentMethod: "COD",
      payment: false,
      date: Date.now()
    };
    
    const newOrder = new orderModel(orderData);
    await newOrder.save();

    await userModel.findByIdAndUpdate(userId, { cartData: {} });
    
    console.log("✅ Order placed successfully:", newOrder._id);
    
    res.json({ success: true, message: "Order Placed", orderId: newOrder._id });
    
  } catch (error) {
    console.error("❌ Place Order Error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Placing orders using Razorpay Method
const placeOrderRazorpay = async (req, res) => {
    try {
        const {userId, items, amount, address} = req.body

        if (!userId) {
            return res.status(401).json({ 
                success: false, 
                message: "User not authenticated" 
            });
        }

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: "Razorpay",
            payment: false,
            date: Date.now()
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        const options = {
            amount: amount * 100,
            currency: currency.toUpperCase(),
            receipt: newOrder._id.toString()
        }

        await razorpayInstance.orders.create(options, (error, order) => {
            if(error) {
                console.log(error)
                return res.json({success: false, message: error })
            }
            res.json({success:true, order})
        })
    } catch (error) {
        console.log(error)
        res.json({success:false, message: error.message})
    }
}

const verifyRazorpay = async (req, res) => {
    try {
        const {userId, razorpay_order_id} =  req.body

        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)
        if(orderInfo.status === 'paid') {
            await orderModel.findByIdAndUpdate(orderInfo.receipt, {payment: true});
            await userModel.findByIdAndUpdate(userId, {cartData: {}})
            res.json({success: true, message: 'Payment Successful'})
        } else {
            res.json({success: false, message: 'Payment Failed'})
        }

    } catch (error) {
        console.log(error)        
        res.json({success: false, message: error.message})
    }
}

// All orders data for Admin Panel
const allOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({})
        res.json({success: true, orders})
    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

// ✅ UPDATED: User Order Data for Frontend
const userOrders = async (req, res) => {
    try {
        console.log("\n📦 === USER ORDERS REQUEST ===");
        
        // ✅ Check multiple locations
        const userId = req.userId || req.body.userId || req.user?._id;
        
        console.log("  - req.userId:", req.userId);
        console.log("  - req.body.userId:", req.body.userId);
        console.log("  - Final userId:", userId);
        
        if (!userId) {
            console.log("❌ No userId found");
            return res.status(401).json({ 
                success: false, 
                message: "User not authenticated" 
            });
        }

        console.log("  - Fetching orders for user:", userId);
        
        const orders = await orderModel.find({ userId });
        
        console.log("  - Found", orders.length, "orders");
        
        res.json({
            success: true, 
            orders: orders
        });

    } catch (error) {
        console.error("❌ User orders error:", error);
        res.status(500).json({
            success: false, 
            message: error.message
        });
    }
};

// update order status from Admin Panel
const updateStatus = async (req, res) => {
    try {
        const {orderId, status} = req.body

        await orderModel.findByIdAndUpdate(orderId, {status})
        res.json({sucess: true, message: 'Status Updated'})
    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

export {verifyRazorpay, placeOrder, placeOrderRazorpay, allOrders, userOrders, updateStatus}