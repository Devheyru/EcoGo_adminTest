// app/api/trips/[id]/accept/route.ts
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

type AcceptBody = {
  driverId: string;
  vehicleId?: string;
};

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = (await req.json()) as AcceptBody;

    if (!body.driverId)
      return NextResponse.json(
        { success: false, message: "driverId is required" },
        { status: 400 }
      );

    // check trip exists and is requestable
    const tripRef = adminDb.collection("rides").doc(id);
    const tripSnap = await tripRef.get();
    if (!tripSnap.exists)
      return NextResponse.json(
        { success: false, message: "rides not found" },
        { status: 404 }
      );

    const trip = tripSnap.data() as any;
    if (trip.status !== "requested") {
      return NextResponse.json(
        { success: false, message: "rides is not available to accept" },
        { status: 409 }
      );
    }

    // verify driver exists and is approved/available
    const driverSnap = await adminDb
      .collection("drivers")
      .doc(body.driverId)
      .get();
    if (!driverSnap.exists)
      return NextResponse.json(
        { success: false, message: "Driver not found" },
        { status: 404 }
      );
    const driver = driverSnap.data() as any;
    if (driver.status !== "approved" && driver.status !== "active") {
      return NextResponse.json(
        { success: false, message: "Driver not available" },
        { status: 409 }
      );
    }

    // assign driver with transaction to avoid race conditions
    await adminDb.runTransaction(async (t) => {
      const fresh = await t.get(tripRef);
      const data = fresh.data() as any;
      if (!data || data.status !== "requested")
        throw new Error("Trip no longer available");
      t.update(tripRef, {
        driverId: body.driverId,
        vehicleId: body.vehicleId ?? driver.vehicleId ?? null,
        status: "accepted",
        acceptedAt: new Date(),
      });
      // optionally mark driver busy
      const driverRef = adminDb.collection("drivers").doc(body.driverId);
      t.update(driverRef, { status: "on_trip", updatedAt: new Date() });
    });

    return NextResponse.json({ success: true, message: "Trip accepted" });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
