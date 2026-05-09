<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Unit;
use App\Models\Property;

class UnitController extends Controller
{
    // ================= GET UNITS BY PROPERTY =================
    public function byProperty($id)
    {
        $property = Property::findOrFail($id);

        $units = Unit::where('property_id', $property->id)->get();

        return response()->json([
            'property' => $property,
            'units' => $units
        ]);
    }

    // ================= CREATE UNIT =================
    public function store(Request $request)
{
    $request->validate([
        'property_id' => 'required|exists:properties,id',
        'name' => 'required|string|max:255',
        'type' => 'required|string',
        'capacity' => 'required|integer|min:1',
        'price_per_night' => 'required|numeric|min:0',
        'description' => 'nullable|string',
        'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
    ]);

    $imagePath = null;

    if ($request->hasFile('image')) {
        $imagePath = $request->file('image')->store('units', 'public');
    }

    $unit = Unit::create([
        'property_id' => $request->property_id,
        'name' => $request->name,
        'type' => $request->type,
        'capacity' => $request->capacity,
        'price_per_night' => $request->price_per_night,
        'description' => $request->description,
        'image' => $imagePath,
        'status' => 'available',
    ]);

    return response()->json([
        'message' => 'Unit created successfully',
        'unit' => $unit
    ], 201);
}

    // ================= UPDATE UNIT =================
    public function update(Request $request, $id)
    {
        $unit = Unit::findOrFail($id);

        $unit->update($request->all());

        return response()->json([
            'message' => 'Unit updated successfully',
            'unit' => $unit
        ]);
    }

    // ================= DELETE UNIT =================
    public function destroy($id)
    {
        $unit = Unit::findOrFail($id);

        $unit->delete();

        return response()->json([
            'message' => 'Unit deleted successfully'
        ]);
    }
}