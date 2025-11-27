// app/api/trips/route.ts
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
// import { getRole } from "@/lib/getRole"; // your role helper
import { ROLE_PERMISSIONS } from "@/lib/permissions";

type CreateTripBody = {
  riderId: string;
  origin: { lat: number; lng: number; address?: string };
  destination: { lat: number; lng: number; address?: string };
  paymentMethod?: "cash" | "card" | "wallet";
  fareEstimate?: number;
  meta?: Record<string, any>;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateTripBody;

    // Basic validation
    if (!body.riderId || !body.origin || !body.destination) {
      return NextResponse.json(
        {
          success: false,
          message: "riderId, origin and destination are required",
        },
        { status: 400 }
      );
    }

    // Ensure rider exists
    const riderDoc = await adminDb.collection("riders").doc(body.riderId).get();
    if (!riderDoc.exists) {
      return NextResponse.json(
        { success: false, message: "Rider not found" },
        { status: 404 }
      );
    }

    // Create trip
    const tripRef = adminDb.collection("rides").doc();
    const tripId = tripRef.id;
    const now = new Date();

    const tripData = {
      id: tripId,
      riderId: body.riderId,
      origin: body.origin,
      destination: body.destination,
      fareEstimate: body.fareEstimate ?? null,
      paymentMethod: body.paymentMethod ?? "cash",
      status: "requested",
      requestedAt: now,
      meta: body.meta ?? {},
    };

    await tripRef.set(tripData);

    // Optionally: push notifications to drivers or add candidate drivers list

    return NextResponse.json(
      { success: true, tripId, trip: tripData },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

// GET /api/trips (list with optional filters)
export async function GET(req: Request) {
  try {
    // optional query params: riderId, driverId, status
    const url = new URL(req.url);
    const riderId = url.searchParams.get("riderId");
    const driverId = url.searchParams.get("driverId");
    const status = url.searchParams.get("status");

    let q = adminDb
      .collection("rides")
      .orderBy("requestedAt", "desc")
      .limit(100);
    if (riderId) q = q.where("riderId", "==", riderId);
    if (driverId) q = q.where("driverId", "==", driverId);
    if (status) q = q.where("status", "==", status);

    const snap = await q.get();
    const trips = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ success: true, trips });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
