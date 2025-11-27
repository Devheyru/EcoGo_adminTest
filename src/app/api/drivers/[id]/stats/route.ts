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
        { success: false, error: "Driver ID is required" },
        { status: 400 }
      );
    }

    // --- Get driver document
    const driverRef = adminDb.collection("drivers").doc(id);
    const driverSnap = await driverRef.get();

    if (!driverSnap.exists) {
      return NextResponse.json(
        { success: false, error: "Driver not found" },
        { status: 404 }
      );
    }

    // --- Query trips completed
    const completedTripsSnap = await adminDb
      .collection("rides")
      .where("driverId", "==", id)
      .where("status", "==", "completed")
      .get();

    const totalCompleted = completedTripsSnap.size;

    // --- Calculate earnings from trips
    let totalFare = 0;
    completedTripsSnap.forEach((doc) => {
      const d = doc.data() as any;
      totalFare += d.fare || 0;
    });

    // --- Today stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayTripsSnap = await adminDb
      .collection("rides")
      .where("driverId", "==", id)
      .where("completedAt", ">=", today)
      .where("status", "==", "completed")
      .get();

    const todayCompleted = todayTripsSnap.size;

    // --- Other statuses
    const ongoingSnap = await adminDb
      .collection("rides")
      .where("driverId", "==", id)
      .where("status", "==", "ongoing")
      .get();

    const cancelledSnap = await adminDb
      .collection("rides")
      .where("driverId", "==", id)
      .where("status", "==", "cancelled")
      .get();

    return NextResponse.json({
      success: true,
      stats: {
        driver: { id: driverSnap.id, ...driverSnap.data() },
        totalCompleted,
        totalEarnings: totalFare,
        todayCompleted,
        ongoing: ongoingSnap.size,
        cancelled: cancelledSnap.size,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
