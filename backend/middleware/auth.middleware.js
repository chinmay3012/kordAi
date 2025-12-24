import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  let token = null;

  // Check Authorization header first (explicit)
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }
  // Then check cookies as fallback
  else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, email }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token expired or invalid" });
  }
}
