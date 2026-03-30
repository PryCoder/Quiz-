import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { generateToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();
    const { email, password, name, role } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const user = await User.create({
      email,
      password,
      name,
      role: role || "student",
    });

    const token = generateToken(user);

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      points: user.points,
      streak: user.streak,
    };

    return NextResponse.json(
      {
        success: true,
        token,
        user: userResponse,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup error:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}