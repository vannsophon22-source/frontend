<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Property;
use Illuminate\Http\Request;

class PropertyController extends Controller
{
    // ================= GET ALL PROPERTIES =================
    public function index()
    {
        $user = auth()->user();
    
        $query = Property::with('owner');
    
        if ($user->role !== 'admin') {
            $query->where('owner_id', $user->id);
        }
    
        return response()->json([
            'properties' => $query->get()
        ]);
    }
    // ================= GET SINGLE PROPERTY =================
    public function show($id)
    {
        $property = Property::with('owner')->find($id);

        if (!$property) {
            return response()->json([
                'message' => 'Property not found'
            ], 404);
        }

        return response()->json([
            'property' => $property
        ]);
    }

    // ================= CREATE PROPERTY =================
    public function store(Request $request)
{
    $user = auth()->user();

    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'description' => 'nullable|string',
        'type' => 'required|string',
        'address' => 'required|string',
        'city' => 'required|string',
        'country' => 'required|string',
    ]);

    $property = Property::create([
        'name' => $validated['name'],
        'description' => $validated['description'] ?? null,
        'type' => $validated['type'],
        'address' => $validated['address'],
        'city' => $validated['city'],
        'country' => $validated['country'],

        // 🔥 IMPORTANT RULE:
        // admin can choose owner_id, owner always himself
        'owner_id' => $user->role === 'admin'
            ? ($request->owner_id ?? $user->id)
            : $user->id,
    ]);

    return response()->json([
        'message' => 'Property created successfully',
        'property' => $property
    ], 201);
}

    // ================= UPDATE PROPERTY (FIXED SAFE VERSION) =================
    public function update(Request $request, $id)
    {
        $property = Property::find($id);

        if (!$property) {
            return response()->json([
                'message' => 'Property not found'
            ], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'type' => 'sometimes|string',
            'address' => 'sometimes|string',
            'city' => 'sometimes|string',
            'country' => 'sometimes|string',
        ]);

        $property->update($validated);

        return response()->json([
            'message' => 'Property updated successfully',
            'property' => $property
        ]);
    }

    // ================= DELETE PROPERTY =================
    public function destroy($id)
    {
        $property = Property::find($id);

        if (!$property) {
            return response()->json([
                'message' => 'Property not found'
            ], 404);
        }

        $property->delete();

        return response()->json([
            'message' => 'Property deleted successfully'
        ]);
    }
}