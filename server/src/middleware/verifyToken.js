const jwt = require("jsonwebtoken");
 
function verifyToken(req, res, next) {
  // 1. Get the token from the Authorization header
  // Header format: "Bearer eyJhbGciOiJIUzI1NiIs..."
  const authHeader = req.headers["authorization"];
 
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }
 
  // 2. Pull out just the token part (after "Bearer ")
  const token = authHeader.split(" ")[1];
 
  // 3. Verify the token using your secret key
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded = { userId: 1, email: "alex@test.com", role: "lister" }
 
    // 4. Attach the decoded user to req so the next function can use it
    req.user = decoded;
 
    // 5. Move on to the next middleware or route handler
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
 
module.exports = verifyToken;
 