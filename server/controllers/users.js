import db from "../database/models/index.js";
const { User } = db;

export async function listUsers(req, res, next) {
  try {
    const users = await User.findAll({
      attributes: ["id", "email", "role", "createdAt"],
      order: [["id", "ASC"]],
    });
    res.json({ users });
  } catch (e) {
    next(e);
  }
}

export async function updateUserRole(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return next({ status: 400, message: "Invalid id" });

    if (req.user.id === id) {
      return next({
        status: 403,
        message: "You cannot change your own role",
      });
    }

    const { role } = req.body;
    if (role !== "admin" && role !== "user") {
      return next({ status: 400, message: "Invalid role" });
    }

    const user = await User.findByPk(id);
    if (!user) return next({ status: 404, message: "User not found" });

    user.role = role;
    await user.save();

    res.json({ id: user.id, email: user.email, role: user.role });
  } catch (e) {
    next(e);
  }
}
