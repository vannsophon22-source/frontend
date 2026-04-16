<?php

namespace App\Http\Controllers;

use App\Models\Property;
use Illuminate\Http\Request;

class PropertyController extends Controller
{
    // Create Property (Admin & Owner only)
    public function store(Request $request)
    {
        $user = auth()->user();

        if (!$user || !in_array($user->role, ['admin', 'owner'])) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'address' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'status' => 'required|in:available,rented',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        $data = $request->all();
        $data['user_id'] = $user->id;

        // Upload image
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = time().'_'.$file->getClientOriginalName();
            $file->move(public_path('uploads/properties'), $filename);
            $data['image'] = 'uploads/properties/'.$filename;
        }

        $property = Property::create($data);

        return response()->json([
            'message' => 'Property created successfully',
            'property' => $property
        ]);
    }

    // Get all properties
    public function index()
    {
        return response()->json(Property::with('user')->get());
    }

    // Delete property
    public function destroy($id)
    {
        $user = auth()->user();
        $property = Property::findOrFail($id);

        if ($user->role !== 'admin' && $property->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $property->delete();

        return response()->json([
            'message' => 'Property deleted successfully'
        ]);
    }
}