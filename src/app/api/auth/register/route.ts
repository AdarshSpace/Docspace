
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/DB";
import User from "@/model/user";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    // 1. Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json(
        { message: "Please provide a valid email" },
        { status: 400 }
      );
    }

    if (password.length < 6 || password.length > 72) {
      return NextResponse.json(
        { message: "Password must be between 6 and 72 characters" },
        { status: 400 }
      );
    }

    console.log("email", email);
    console.log("password", password);

    // 2. Connect to MongoDB
    await connectToDatabase();

    // 3. Check whether the user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { message: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // 4. Create and save the user
    // Your User model's pre-save hook hashes the password.
    const user = await User.create({
      email,
      password,
    });

    // 5. Return success without exposing the password
    return NextResponse.json(
      {
        message: "Registration successful",
        user: {
          id: user._id.toString(),
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    // Handle duplicate email if simultaneous requests race
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return NextResponse.json(
        { message: "An account with this email already exists" },
        { status: 409 }
      );
    }

    console.error("Registration error:", error);

    return NextResponse.json(
      { message: "Something went wrong during registration" },
      { status: 500 }
    );
  }
}
