"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { FiCalendar, FiCheckCircle, FiCreditCard, FiAlertCircle } from "react-icons/fi";

export default function CheckoutPage() {
  const searchParams = useSearchParams();

  const unitId = searchParams.get("unitId");
  const title = searchParams.get("title");
  const price = parseFloat(searchParams.get("price") || "0");
  const paymentPolicy = searchParams.get("payment_policy"); // ⭐ IMPORTANT

  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [cardName, setCardName] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");

  const isPayLater = paymentPolicy === "pay_later";
  const isPayFirst = paymentPolicy === "pay_first";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        isPayLater
          ? "/api/checkout/pay-later"
          : "/api/checkout/pay-first",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            unit_id: unitId,
            check_in_date: checkInDate,
            check_out_date: checkOutDate,
            total_price: price,
            payment_method: isPayLater ? "Cash" : "Visa",
          }),
        }
      );

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      setStatus("success");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FiCheckCircle className="text-green-500 text-5xl mx-auto" />
          <h1 className="text-2xl font-bold mt-4">Booking Successful</h1>
          <p className="text-gray-500">
            {isPayLater
              ? "You will pay on arrival (Cash)"
              : "Payment completed successfully"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-4">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow">

        <h1 className="text-xl font-bold mb-4">{title}</h1>

        <p className="mb-4 text-sm text-gray-500">
          Payment Type:{" "}
          <span className="font-bold">
            {isPayLater ? "Pay Later (Cash)" : "Pay First (Visa)"}
          </span>
        </p>

        {error && (
          <div className="bg-red-100 p-2 text-red-600 mb-4 flex gap-2">
            <FiAlertCircle /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Dates */}
          <div>
            <label>Check In</label>
            <input
              type="date"
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
              className="w-full border p-2"
              required
            />
          </div>

          <div>
            <label>Check Out</label>
            <input
              type="date"
              value={checkOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
              className="w-full border p-2"
              required
            />
          </div>

          {/* Visa only */}
          {isPayFirst && (
            <div>
              <label>Card Name</label>
              <input
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className="w-full border p-2"
                required
              />
            </div>
          )}

          {/* Price */}
          <div className="font-bold text-lg">
            Total: ${price.toFixed(2)}
          </div>

          <button
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded"
          >
            {loading
              ? "Processing..."
              : isPayLater
              ? "Confirm Booking (Pay Later)"
              : "Pay Now (Visa)"}
          </button>
        </form>
      </div>
    </div>
  );
}
