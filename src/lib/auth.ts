import { cookies } from "next/headers";
import { connection } from "next/server";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export async function getAuthenticatedUser() {
  await connection();
  const token = (await cookies()).get("token")?.value;
  const secret = process.env.JWT_SECRET;

  if (!token || !secret) return null;

  try {
    const payload = jwt.verify(token, secret, {
      algorithms: ["HS256"],
    });

    if (
      typeof payload === "string" ||
      typeof payload.sub !== "string" ||
      !mongoose.isValidObjectId(payload.sub)
    ) {
      return null;
    }

    return { userId: payload.sub };
  } catch {
    return null;
  }
}
