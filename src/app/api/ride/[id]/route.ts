// app/api/trips/[id]/route.ts (GET)
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const doc = await adminDb.collection("rides").doc(id).get();
    if (!doc.exists)
      return NextResponse.json(
        { success: false, message: "Trip not found" },
        { status: 404 }
      );
    return NextResponse.json({
      success: true,
      trip: { id: doc.id, ...doc.data() },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
