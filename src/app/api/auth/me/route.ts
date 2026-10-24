import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/DB";
import { getAuthenticatedUser } from "@/lib/auth";
import User from "@/model/user";

export async function GET() {
  const session = await getAuthenticatedUser();

  try {
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const user = await User.findById(session.userId).select("email");

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ email: user.email });
  } catch (error) {
    console.error("Auth me error:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
