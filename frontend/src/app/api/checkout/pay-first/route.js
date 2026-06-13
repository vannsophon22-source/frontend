import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      unit_id,
      check_in_date,
      check_out_date,
      total_price,
      payment_method,
    } = body;

    if (
      !unit_id ||
      !check_in_date ||
      !check_out_date ||
      !total_price
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields.",
        },
        { status: 400 }
      );
    }

    const bookingId =
      Math.floor(1000 + Math.random() * 9000);

    const bookingRecord = {
      booking_id: bookingId,
      user_id: 99,
      unit_id: Number(unit_id),

      status: "paid",

      check_in_date,
      check_out_date,

      total_price: Number(total_price),
    };

    const paymentRecord = {
      payment_id:
        Math.floor(50000 + Math.random() * 50000),

      booking_id: bookingId,

      payment_method:
        payment_method || "Visa",

      payment_status: "completed",

      payment_date:
        new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        booking: bookingRecord,
        payment: paymentRecord,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}
