import type { Request } from "express";
import jwt from "jsonwebtoken";

import dotenv from "dotenv";
dotenv.config();

interface JwtPayload {
  _id: unknown;
  username: string;
  email: string;
}

export const authenticateToken = (context: { req: Request }) => {
  // console.log('attempting to grab context', context);
  const { req }: any = context;

  // Extract the token from the Authorization header
  let token = req.headers.authorization || "";
  console.log("token from context:", token);
  if (token) {
    token = token.split(" ").pop()?.trim() || "";
  }

  // If no token is provided, return the context without modification
  if (!token) {
    console.log("No token found during auth");
    return context;
  }
  console.log("token exists", token);
  // Try to verify the token
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET_KEY || "", {
      maxAge: "2h",
    }) as { data: JwtPayload };
    console.log("Verified token data: ", data);
    // If the token is valid, attach the user data to the context
    return { ...context, user: data };
  } catch (err) {
    // If the token is invalid, log an error message
    console.error("Invalid token:", err);
    return context;
  }
};

export const signToken = (username: string, email: string, _id: unknown) => {
  const payload = { username, email, _id };
  const secretKey = process.env.JWT_SECRET_KEY || "";

  return jwt.sign(payload, secretKey, { expiresIn: "1h" });
};
