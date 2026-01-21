import jwt from "jsonwebtoken";

export function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || "";
    const [type, token] = header.split(" ");

    if (type !== "Bearer" || !token) {
      return next({ status: 401, message: "Unauthorized" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch {
    next({ status: 401, message: "Token invalid or expired" });
  }
}
