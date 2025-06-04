
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import stripe from "stripe";
import User from "../models/user.js"



export const placeOrderStripe = async (req, res) => {
try{
    const{userId,items,address}=req.body;
    const{origin}=req.headers;
    if(!address||items.length===0){
        return res.status(400).json({success:false,message:"Please provide address and items to place order"});
    }

    let productData=[];

    let amount=await items.reduce(async (acc, item) => {
    const product = await Product.findById(item.product);
    productData.push({
       
        name: product.name,
        price: product.offerPrice,
        quantity: item.quantity
    });
    return (await acc)+product.offerPrice*item.quantity;
},0)
amount+=Math.floor(amount*0.02); // Adding 2% tax

   const order= await Order.create({
        userId,
        items,
        amount,
        address,
        paymentType: "Online",
       
    });

    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    const line_items= productData.map((item) => ({
      
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
          },
          unit_amount: Math.floor(item.price+item.price*0.02) * 100, // Convert to paise
        },
        quantity: item.quantity,
    }))
    const session = await stripeInstance.checkout.sessions.create({
        line_items,
        mode: "payment",
        success_url: `${origin}/loader?next=my-orders`,
        cancel_url: `${origin}/cart`,
        metadata: {
            orderId: order._id.toString(),
            userId,
        },
      });
  

    return res.status(201).json({success:true,url:session.url});
}catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
}


export const placeOrder = async (req, res) => {
try{
    const{userId,items,address}=req.body;
    if(!address||items.length===0){
        return res.status(400).json({success:false,message:"Please provide address and items to place order"});
    }

    let amount=await items.reduce(async (acc, item) => {
    const product = await Product.findById(item.product);
    return (await acc)+product.offerPrice*item.quantity;
},0)
amount+=Math.floor(amount*0.02); // Adding 2% tax

   const order= await Order.create({
        userId,
        items,
        amount,
        address,
        paymentType: "COD",
       
    });

 

    res.status(201).json({success:true,message:"Order placed successfully",order});


}catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
}

export const stripeWebhook=async (req, res) => {
    const stripeInstance =new stripe(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers["stripe-signature"];
    let event;
    try {
        event= stripeInstance.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );  
    } catch (error) {
        console.log(error.message);
         res.status(400).send(`Webhook Error: ${error.message}`);
        
    }
    // Handle the event
    switch (event.type) {
        case "payment_intent.succeeded":{
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;
        //    getting session  metadata
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId,   
            });
            const {orderId, userId}=session.data[0].metadata;
            // update order
            await Order.findByIdAndUpdate(orderId,{isPaid:true});
            // clear cart
            await User.findByIdAndUpdate(userId,{cartItems:{}});
          break;
        }
        case "payment_intent.payment_failed":{
             const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;
        //    getting session  metadata
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId,   
            });
            const {orderId}=session.data[0].metadata;
            await Order.findByIdAndDelete(orderId);
            // clear cart
            break;
        }
        default:
            console.log(`Unhandled event type ${event.type}`);
            break
    }
    res.json({recieved:true});

}


export const getUserOrders = async (req, res) => {
    try {
      const { userId } = req.query;
      // console.log("userId:", userId); 
      // console.log(userId);
  
      const orders = await Order.find({
        userId,
        $or: [{ paymentType: "COD" }, { isPaid: true }],
      })
        .populate("items.product address")
        .sort({ createdAt: -1 });
  
      res.json({ success: true, orders });
      // console.log("Found orders:", orders);
      // console.log(orders);
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  };
  
  
  // get all orders
  
  export const getAllOrders=async(req,res)=>{
      try{
          const orders = await Order.find({
              $or:[{paymentType:"COD"},{isPaid:true}]
          }).populate("items.product address").sort({createdAt:-1});
          res.json({success:true,orders});
      }
      catch(error){
          console.log(error.message);
          res.status(500).json({success:false,message:error.message})
      }
  }