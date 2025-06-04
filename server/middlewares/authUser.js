import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return res.json({ success: false, message: "Not authorized, no token" });
  }

  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
    if (tokenDecode.Id) {
    req.body = req.body || {};
      req.body.userId = tokenDecode.Id;
    } else {
      return res.json({
        success: false,
        message: "Not authorized, invalid token",
      });
    }
    next();
  } catch (error) {
    res.json({
      success: false,
      message: error.message || "Failed to authenticate user",
    });
  }
};

export default authUser;
