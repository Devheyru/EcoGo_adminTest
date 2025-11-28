import { NextRequest, NextResponse } from "next/server";
import { createSessionCookie, revokeSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { idToken } = body;

  if (!idToken) {
    return NextResponse.json({ error: "Missing ID token" }, { status: 400 });
  }

  try {
    await createSessionCookie(idToken);
    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  await revokeSession();
  return NextResponse.json({ status: "success" });
}
