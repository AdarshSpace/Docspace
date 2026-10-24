
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectToDatabase } from "@/lib/DB";
import { getAuthenticatedUser } from "@/lib/auth";
import DocumentModel from "@/model/document";
import DocumentShare from "@/model/documentShare";
import User from "@/model/user";

export async function GET() {
  const auth = await getAuthenticatedUser();

  try {
    if (!auth) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const userId = new mongoose.Types.ObjectId(auth.userId);

    // 1. Fetch documents created by the logged-in user
    const myDocuments = await DocumentModel.find({
      ownerId: userId,
    })
      .select("_id title updatedAt")
      .sort({ updatedAt: -1 })
      .lean();

    // 2. Find documents shared with the logged-in user
    const shares = await DocumentShare.find({
      userId,
    })
      .select("documentId")
      .lean();

    const sharedDocumentIds = shares.map(
      (share) => share.documentId
    );

    const sharedDocuments = await DocumentModel.find({
      _id: { $in: sharedDocumentIds },
      ownerId: { $ne: userId },
    })
      .select("_id title ownerId updatedAt")
      .sort({ updatedAt: -1 })
      .lean();

    // 3. Fetch owners' names and emails
    const ownerIds = [
      ...new Set(
        sharedDocuments.map((doc) => doc.ownerId.toString())
      ),
    ];

    const owners = await User.find({
      _id: { $in: ownerIds },
    })
      .select("_id name email")
      .lean();

    const ownerMap = new Map(
      owners.map((owner) => [
        owner._id.toString(),
        { name: owner.name, email: owner.email },
      ])
    );

    // 4. Format shared documents for the dashboard
    const formattedSharedDocuments = sharedDocuments.map(
      (doc) => ({
        id: doc._id.toString(),
        title: doc.title,
        updatedAt: doc.updatedAt,
        owner: ownerMap.get(doc.ownerId.toString()) ?? {
          name: null,
          email: null,
        },
      })
    );

    return NextResponse.json({
      myDocuments: myDocuments.map((doc) => ({
        id: doc._id.toString(),
        title: doc.title,
        updatedAt: doc.updatedAt,
      })),
      sharedDocuments: formattedSharedDocuments,
    });
  } catch (error) {
    console.error("Dashboard documents error:", error);

    return NextResponse.json(
      { message: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}
