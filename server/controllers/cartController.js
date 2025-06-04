import User from "../models/user.js";




//Update User cartItems: /api/cart/update
export const updateCart = async (req, res) => {
  try {
    const { userId, cartData } = req.body;

    if (!userId || !cartData) {
      return res.status(400).json({ success: false, message: "Missing userId or cartData" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.cartItems = cartData;
    await user.save();

    res.json({ success: true, message: "Cart updated successfully" });
  } catch (error) {
    console.error("Cart update error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update cart",
    });
  }
};



