import jwt from 'jsonwebtoken';



export const sellerLogin=async(req,res)=>{
    try{
    req.body = req.body || {};
    const { email, password } = req.body;

    if(password===process.env.SELLER_PASSWORD && email===process.env.SELLER_EMAIL){
        const token = jwt.sign({ email }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        res.cookie("sellerToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Use secure cookies in production
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // Helps prevent CSRF attacks
        });

       return res.json({ success: true, message: "Seller logged in successfully" });
    }
    else{
        return res.json({ success: false, message: "Invalid email or password" });
    }
    }
    catch(error){
        console.log(error.message || "Failed to login seller");
        res.json({
            success: false,
            message: error.message || "Failed to login seller",
        });
    }
} 


export const isSellerAuth = async (req, res) => {
    try{
        return res.json({success:true});
    }catch(error){
        console.log(error.message );
        res.json({success:false,message:error.message || "Failed to authenticate user"});
    }
};

export const sellerLogout=async(req,res)=>{
    try{
        res.clearCookie("sellerToken", "", {
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

