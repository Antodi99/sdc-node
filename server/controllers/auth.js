import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../database/models/index.js";
import { registerSchema, loginSchema } from "../validators/authSchemas.js";

const { User } = db;

function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: Number(process.env.JWT_EXPIRES) } // seconds
  );
}

export async function register(req, res, next) {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return next({ status: 400, message: error.message });
    }

    const { email, password } = value;

    const exists = await User.findOne({ where: { email } });
    if (exists) {
      return next({ status: 409, message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      id: user.id,
      email: user.email,
    });
  } catch (e) {
    next(e);
  }
}

export async function login(req, res, next) {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return next({ status: 400, message: error.message });
    }

    const { email, password } = value;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return next({ status: 401, message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return next({ status: 401, message: "Invalid credentials" });
    }

    const token = signToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (e) {
    next(e);
  }
}
