import * as dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import { GraphQLError } from "graphql";
import { Request } from "express";
import { Types } from "mongoose";

interface TokenUser {
  username: string;
  email: string;
  _id: Types.ObjectId | string;
}

const secret = process.env.JWT_SECRET || "mysecretsshhhhh";
const expiration = "2h";

export const authMiddleware = async ({ req }: { req: Request }) => {
  let token = req.body.token || req.query.token || req.headers.authorization;

  if (req.headers.authorization) {
    token = token.split(" ").pop().trim();
  }

  if (!token) {
    return req;
  }

  try {
    const { data } = jwt.verify(token, secret) as { data: TokenUser };
    req.user = data;
  } catch {
    console.log("Invalid token");
    throw new GraphQLError("Invalid token", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  return req;
};

export const signToken = (user: TokenUser) => {
  const payload = {
    username: user.username,
    email: user.email,
    _id: user._id.toString(),
  };
  return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
};
