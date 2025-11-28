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

    // Fetch driver profile
    const driverRef = adminDb.collection("drivers").doc(id);
    const driverSnap = await driverRef.get();

    if (!driverSnap.exists) {
      return NextResponse.json(
        { success: false, error: "Driver not found" },
        { status: 404 }
      );
    }

    const driverData = driverSnap.data();

    // Prepare timestamp conversion
    const convertTS = (ts: any) =>
      ts && ts.toDate ? ts.toDate().toISOString() : null;

    // Get all driver rides
    const ridesSnap = await adminDb
      .collection("rides")
      .where("driverId", "==", id)
      .get();

    let totalCompleted = 0;
    let totalEarnings = 0;
    let ongoing = 0;
    let cancelled = 0;
    let todayCompleted = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    ridesSnap.forEach((doc) => {
      const r = doc.data();

      if (r.status === "completed") {
        totalCompleted++;
        totalEarnings += r.fare || 0;

        const comp = r.completedAt?.toDate();
        if (comp && comp >= today) {
          todayCompleted++;
        }
      }

      if (r.status === "cancelled") cancelled++;
      if (r.status === "ongoing") ongoing++;
    });

    return NextResponse.json({
      success: true,
      driverId: id,
      driver: {
        ...(driverData || {}),
        createdAt: convertTS(driverData?.createdAt),
        updatedAt: convertTS(driverData?.updatedAt),
      },
      stats: {
        rideStats: {
          totalCompleted,
          ongoing,
          cancelled,
        },
        earningStats: {
          totalEarnings,
        },
        todayStats: {
          todayCompleted,
        },
      },
    });
;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
