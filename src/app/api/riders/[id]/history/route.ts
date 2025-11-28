import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Rider ID is required" },
        { status: 400 }
      );
    }

    // ----- Check rider exists -----
    const riderRef = adminDb.collection("riders").doc(id);
    const riderSnap = await riderRef.get();

    if (!riderSnap.exists) {
      return NextResponse.json(
        { success: false, error: "Rider not found" },
        { status: 404 }
      );
    }

    // ----- Fetch rider trip history -----
    const tripsSnap = await adminDb
      .collection("rides")
      .where("riderId", "==", id)
      .orderBy("requestedAt", "desc") // IMPORTANT: this field exists
      .get();

    const trips = tripsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      riderId: id,
      totalTrips: trips.length,
      history: trips,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
