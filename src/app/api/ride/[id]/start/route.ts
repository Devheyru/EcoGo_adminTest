// app/api/trips/[id]/start/route.ts
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

type StartBody = { driverId: string };

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = (await req.json()) as StartBody;

    const tripRef = adminDb.collection("rides").doc(id);
    const tripSnap = await tripRef.get();
    if (!tripSnap.exists)
      return NextResponse.json(
        { success: false, message: "Trip not found" },
        { status: 404 }
      );

    const trip = tripSnap.data() as any;
    if (trip.driverId !== body.driverId)
      return NextResponse.json(
        { success: false, message: "Driver not assigned to this trip" },
        { status: 403 }
      );
    if (trip.status !== "accepted")
      return NextResponse.json(
        { success: false, message: "Trip cannot be started" },
        { status: 409 }
      );

    await tripRef.update({
      status: "ongoing",
      startedAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true, message: "Trip started" });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
