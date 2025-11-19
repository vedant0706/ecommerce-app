import orderModel from "../models/orderModel.js"
import userModel from "../models/userModel.js";
import Razorpay from 'razorpay';

// global variables
const currency = 'inr';
const deliveryCharge = 10;

// gateway intialize
const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})


// ✅ FIXED: Placing orders using COD Method
const placeOrder = async (req, res) => {
  try {
    // ✅ Get userId from authUser middleware (it's already set in req.body.userId)
    const { userId, items, amount, address } = req.body;
    
    console.log("📦 Place Order - User ID:", userId); // Debug
    console.log("📦 Place Order - Items:", items); // Debug
    
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
    
    // Save order to database
    const newOrder = new orderModel(orderData);
    await newOrder.save();

    // ✅ Clear user's cart after successful order
    await userModel.findByIdAndUpdate(userId, { cartData: {} });
    
    console.log("✅ Order placed successfully:", newOrder._id); // Debug
    
    res.json({ success: true, message: "Order Placed", orderId: newOrder._id });
    
  } catch (error) {
    console.error("❌ Place Order Error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ✅ FIXED: Placing orders using Razorpay Method
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

// User Order Data for Frontend
const userOrders = async (req, res) => {
    try {
        const {userId} = req.body
        
        if (!userId) {
            return res.status(401).json({ 
                success: false, 
                message: "User not authenticated" 
            });
        }

        const orders = await orderModel.find({userId})
        res.json({success:true, orders})

    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }

}

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