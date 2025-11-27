import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: riderId } = await context.params;

    if (!riderId) {
      return NextResponse.json(
        { success: false, error: "Rider ID is required" },
        { status: 400 }
      );
    }

    // --- Check rider exists
    const riderRef = adminDb.collection("users").doc(riderId);
    const riderSnap = await riderRef.get();

    if (!riderSnap.exists) {
      return NextResponse.json(
        { success: false, error: "Rider not found" },
        { status: 404 }
      );
    }

    // --- Fetch all rider trips
    const tripsSnap = await adminDb
      .collection("rides")
      .where("riderId", "==", riderId)
      .orderBy("createdAt", "desc")
      .get();

    const trips = tripsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      total: trips.length,
      history: trips,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
