// app/api/trips/[id]/cancel/route.ts
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

type CancelBody = { by: "rider" | "driver" | "system"; reason?: string };

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = (await req.json()) as CancelBody;

    const tripRef = adminDb.collection("rides").doc(id);
    const tripSnap = await tripRef.get();
    if (!tripSnap.exists)
      return NextResponse.json(
        { success: false, message: "Trip not found" },
        { status: 404 }
      );

    const trip = tripSnap.data() as any;
    if (trip.status === "completed" || trip.status === "cancelled") {
      return NextResponse.json(
        { success: false, message: "Trip cannot be cancelled" },
        { status: 409 }
      );
    }

    await tripRef.update({
      status: "cancelled",
      cancelledAt: new Date(),
      cancelReason: body.reason ?? null,
      updatedAt: new Date(),
    });

    // If driver assigned, set driver available again
    if (trip.driverId) {
      await adminDb
        .collection("drivers")
        .doc(trip.driverId)
        .update({ status: "active", updatedAt: new Date() })
        .catch(() => {});
    }

    return NextResponse.json({ success: true, message: "Trip cancelled" });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
