import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      unit_id,
      check_in_date,
      check_out_date,
      total_price,
    } = body;

    // Validation
    if (
      !unit_id ||
      !check_in_date ||
      !check_out_date ||
      !total_price
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing mandatory booking fields.",
        },
        { status: 400 }
      );
    }

    // Generate IDs
    const bookingId =
      Math.floor(3000 + Math.random() * 7000);

    const paymentId =
      Math.floor(60000 + Math.random() * 40000);

    // Booking = Reserved
    const bookingRecord = {
      booking_id: bookingId,
      user_id: 102,
      unit_id: Number(unit_id),

      status_id: 1, // Reserved / Pending

      check_in_date,
      check_out_date,

      total_price: Number(total_price),
    };

    // Payment = Not paid yet
    const paymentRecord = {
      payment_id: paymentId,

      booking_id: bookingId,

      payment_method: "Cash",

      payment_status: "Unpaid",

      payment_date: null,
    };

    console.log("\n===== PAY LATER BOOKING =====");
    console.log("BOOKING:", bookingRecord);
    console.log("PAYMENT:", paymentRecord);
    console.log("=============================\n");

    return NextResponse.json(
      {
        success: true,
        message:
          "Booking reserved successfully. Payment will be collected during check-in.",

        data: {
          booking: bookingRecord,
          payment: paymentRecord,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error.",
      },
      { status: 500 }
    );
  }
}
