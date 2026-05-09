<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\Unit;
use Carbon\Carbon;

class BookingController extends Controller
{
    private function checkAvailability($unitId, $checkIn, $checkOut)
{
    return !Booking::where('unit_id', $unitId)
        ->where(function ($query) use ($checkIn, $checkOut) {

            $query->whereBetween('check_in', [$checkIn, $checkOut])
                  ->orWhereBetween('check_out', [$checkIn, $checkOut])
                  ->orWhere(function ($q) use ($checkIn, $checkOut) {
                      $q->where('check_in', '<=', $checkIn)
                        ->where('check_out', '>=', $checkOut);
                  });

        })
        ->exists();
}

    public function store(Request $request)
    {
        $request->validate([
            'unit_id' => 'required|exists:units,id',
            'check_in' => 'required|date',
            'check_out' => 'required|date',
            'guests' => 'required|integer|min:1',
        ]);

        $unit = Unit::findOrFail($request->unit_id);

        $available = $this->checkAvailability(
            $unit->id,
            $request->check_in,
            $request->check_out
        );

        if (!$available) {
            return response()->json([
                'message' => 'Unit not available'
            ], 400);
        }

        $nights = Carbon::parse($request->check_in)
            ->diffInDays($request->check_out);

        $booking = Booking::create([
            'user_id' => auth()->id(),
            'unit_id' => $unit->id,
            'check_in' => $request->check_in,
            'check_out' => $request->check_out,
            'guests' => $request->guests,
            'total_price' => $nights * $unit->price_per_night,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Booking created',
            'booking' => $booking
        ]);
    }
}