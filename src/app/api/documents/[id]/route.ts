
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/DB";
import { getAuthenticatedUser } from "@/lib/auth";
import DocumentModel from "@/model/document";
import DocumentShare from "@/model/documentShare";

type Context = {
  params: Promise<{ id: string }>;
};

async function getAccess(documentId: string, userId: string) {
  const document = await DocumentModel.findById(documentId);

  if (!document) return null;

  // The owner always has access.
  if (document.ownerId.toString() === userId) {
    return { document };
  }

  // Other users need explicit permission from the owner.
  const share = await DocumentShare.findOne({
    documentId: document._id,
    userId,
  });

  if (!share) return null;

  return { document };
}

export async function GET(_request: Request, context: Context) {
  const user = await getAuthenticatedUser();

  if (!user) {
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
    await connectToDatabase();

    const access = await getAccess(id, user.userId);

    if (!access) {
      return NextResponse.json(
        { message: "Document not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: access.document._id.toString(),
      title: access.document.title,
      content: access.document.content,
      updatedAt: access.document.updatedAt,
    });
  } catch (error) {
    console.error("Read document error:", error);

    return NextResponse.json(
      { message: "Failed to load document" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, context: Context) {
  const user = await getAuthenticatedUser();

  if (!user) {
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

    if (
      (body.title !== undefined &&
        (typeof body.title !== "string" ||
          !body.title.trim() ||
          body.title.trim().length > 200)) ||
      (body.content !== undefined &&
        typeof body.content !== "string") ||
      (body.title === undefined && body.content === undefined)
    ) {
      return NextResponse.json(
        { message: "Invalid document data" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const access = await getAccess(id, user.userId);

    if (!access) {
      return NextResponse.json(
        { message: "Document not found" },
        { status: 404 }
      );
    }

    if (body.title !== undefined) {
      access.document.title = body.title.trim();
    }

    if (body.content !== undefined) {
      access.document.content = body.content;
    }

    await access.document.save();

    return NextResponse.json({
      message: "Document saved",
      title: access.document.title,
      content: access.document.content,
      updatedAt: access.document.updatedAt,
    });
  } catch (error) {
    console.error("Update document error:", error);

    return NextResponse.json(
      { message: "Failed to save document" },
      { status: 500 }
    );
  }
}
