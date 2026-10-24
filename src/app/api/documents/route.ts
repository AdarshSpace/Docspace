
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/DB";
import DocumentModel from "@/model/document";
import { getAuthenticatedUser } from "@/lib/auth";


export async function POST(request: Request) {
    const user = await getAuthenticatedUser();
  
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
  
    try {
      const body = await request.json();
  
      const title =
        typeof body.title === "string" ? body.title.trim() : "";
  
      if (!title) {
        return NextResponse.json(
          { message: "Document title is required" },
          { status: 400 }
        );
      }
  
      if (title.length > 200) {
        return NextResponse.json(
          { message: "Title cannot exceed 200 characters" },
          { status: 400 }
        );
      }
  
      await connectToDatabase();
  
      const document = await DocumentModel.create({
        title,
        content: "",
        ownerId: user.userId,
      });
  
      return NextResponse.json(
        {
          id: document._id.toString(),
          title: document.title,
          content: document.content,
          updatedAt: document.updatedAt,
        },
        { status: 201 }
      );
    } catch (error) {
      console.error("Create document error:", error);
  
      return NextResponse.json(
        { message: "Failed to create document" },
        { status: 500 }
      );
    }
  }
  
