export function requireAdmin(req, _res, next) {
  if (req.user?.role !== "admin") {
    return next({ status: 403, message: "Forbidden" });
  }
  next();
}
