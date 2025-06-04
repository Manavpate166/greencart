//Register User:api/user/register
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";


export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.json({ success: false, message: "Missing details" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });
    const token = jwt.sign({ Id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // Helps prevent CSRF attacks
    });

    res.json({ success: true, user: { name: user.name, email: user.email } });
  } catch (error) {
    console.log(error.message || "Failed to register user");
    res.json({
      success: false,
      message: error.message || "Failed to register user",
    });
  }
};

//Login user: api/user/login
export const login = async (req, res) => {
  try {
    req.body = req.body || {};
    const { email, password } = req.body;
    if (!email || !password) {
      return res.json({
        success: false,
        message: "Email and Password are required",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "Invalid email or password" });
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.json({ success: false, message: "Invalid email or password" });
    const token = jwt.sign({ Id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // Helps prevent CSRF attacks
    });

    res.json({ success: true, user: { name: user.name, email: user.email } });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message || "Failed to register user",
    });
  }
};

//checkAuth:/api/user/is-Auth
export const isAuth = async (req, res) => {
    try{
        const{userId}=req.body;
        const user=await User.findById(userId).select('-password')
        return res.json({success:true,user});
    }catch(error){
        console.log(error.message );
        res.json({success:false,message:error.message || "Failed to authenticate user"});
    }
};


// LogOut User: /api/user/logout
export const logout=async(req,res)=>{
    try{
        res.clearCookie("token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Use secure cookies in production
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            // maxAge: 0, // Set maxAge to 0 to delete the cookie
        });
        return res.json({success:true,message:"User logged out successfully"});
    }catch(error){
        console.log(error.message);
        res.json({success:false,message:error.message || "Failed to logout user"});
    }
}
