// app/api/trips/[id]/complete/route.ts
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

// ---- Helper function for fare calculation ---- //
function calcFare(distanceKm: number, durationMin: number) {
  const base = 2.5; // base fare
  const perKm = 1.2;
  const perMin = 0.2;
  return Math.max(5, base + perKm * distanceKm + perMin * durationMin);
}

type CompleteBody = {
  driverId: string;
  distanceKm?: number;
  durationMin?: number;
  actualFare?: number;
  paymentMethod?: "cash" | "card" | "wallet";
};

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = (await req.json()) as CompleteBody;

    if (!body.driverId) {
      return NextResponse.json(
        { success: false, error: "driverId is required" },
        { status: 400 }
      );
    }

    const tripRef = adminDb.collection("rides").doc(id);

    // ---- READ trip BEFORE starting transaction ---- //
    const tripSnap = await tripRef.get();
    if (!tripSnap.exists) {
      return NextResponse.json(
        { success: false, message: "Trip not found" },
        { status: 404 }
      );
    }

    const trip = tripSnap.data() as any;

    if (trip.driverId !== body.driverId) {
      return NextResponse.json(
        { success: false, message: "Driver not assigned to this trip" },
        { status: 403 }
      );
    }

    if (trip.status !== "ongoing") {
      return NextResponse.json(
        { success: false, message: "Trip not in progress" },
        { status: 409 }
      );
    }

    // ---- Calculate final fare ---- //
    const distanceKm = body.distanceKm ?? trip.distanceKm ?? 0;
    const durationMin = body.durationMin ?? trip.durationMin ?? 0;
    const fare = body.actualFare ?? calcFare(distanceKm, durationMin);

    // ---- Prepare references ---- //
    const walletRef = adminDb.collection("wallets").doc(trip.driverId);
    const paymentRef = adminDb.collection("payments").doc();
    const driverRef = adminDb.collection("drivers").doc(trip.driverId);

    // ---- READ wallet BEFORE transaction writes ---- //
    const walletSnap = await walletRef.get();
    const walletExists = walletSnap.exists;
    const walletData = walletSnap.data() as any;

    // ---- DO ALL WRITES TOGETHER INSIDE TRANSACTION ---- //
    await adminDb.runTransaction(async (t) => {
      // Update trip → completed
      t.update(tripRef, {
        status: "completed",
        completedAt: new Date(),
        distanceKm,
        durationMin,
        fare,
        paymentStatus: "pending",
        updatedAt: new Date(),
      });

      // Create payment record
      t.set(paymentRef, {
        id: paymentRef.id,
        tripId: id,
        riderId: trip.riderId,
        driverId: trip.driverId,
        amount: fare,
        method: body.paymentMethod ?? trip.paymentMethod ?? "cash",
        status: "pending",
        createdAt: new Date(),
      });

      // Wallet update / create
      if (walletExists) {
        t.update(walletRef, {
          totalEarnings: (walletData.totalEarnings || 0) + fare,
          availableBalance: (walletData.availableBalance || 0) + fare,
          updatedAt: new Date(),
        });
      } else {
        t.set(walletRef, {
          id: walletRef.id,
          driverId: trip.driverId,
          totalEarnings: fare,
          availableBalance: fare,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      // Set driver back to active
      t.update(driverRef, {
        status: "active",
        updatedAt: new Date(),
      });
    });

    return NextResponse.json({
      success: true,
      message: "Trip completed successfully. Payment created.",
      fare,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
