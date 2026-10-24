
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/DB";
import DocumentModel from "@/model/document";
import DocumentShare from "@/model/documentShare";
import User from "@/model/user";

type Context = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: Context) {
  const token = (await cookies()).get("token")?.value;
  const secret = process.env.JWT_SECRET;

  if (!token || !secret) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  let userId: string;

  try {
    const payload = jwt.verify(token, secret, {
      algorithms: ["HS256"],
    });

    if (
      typeof payload === "string" ||
      !payload.sub ||
      !mongoose.isValidObjectId(payload.sub)
    ) {
      throw new Error("Invalid token");
    }

    userId = payload.sub;
  } catch {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await context.params;

  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json(
      { message: "Document not found" },
      { status: 404 }
    );
  }

  try {
    const body = await request.json();
    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        return NextResponse.json(
          { message: "Please provide a valid email" },
          { status: 400 }
        );
      }

    await connectToDatabase();

    const document = await DocumentModel.findOne({
      _id: id,
      ownerId: userId,
    });

    if (!document) {
      return NextResponse.json(
        { message: "Document not found or you are not its owner" },
        { status: 404 }
      );
    }

    const recipient = await User.findOne({ email }).select("_id email");

    if (!recipient) {
      return NextResponse.json(
        { message: "No registered user found with this email" },
        { status: 404 }
      );
    }

    if (recipient._id.toString() === userId) {
      return NextResponse.json(
        { message: "You already own this document" },
        { status: 400 }
      );
    }

    await DocumentShare.findOneAndUpdate(
      {
        documentId: document._id,
        userId: recipient._id,
      },
      {
        $set: {
          sharedBy: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    );

    return NextResponse.json({
      message: `Document shared with ${recipient.email}`,
    });
  } catch (error) {
    console.error("Share document error:", error);

    return NextResponse.json(
      { message: "Failed to share document" },
      { status: 500 }
    );
  }
}
