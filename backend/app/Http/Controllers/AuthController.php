<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Telegram\Bot\Api as TelegramApi;

class AuthController extends Controller
{
    // ---------------- Send OTP ----------------
    public function sendOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'telegram_id' => 'required|string',
            'telegram_username' => 'nullable|string',
        ]);

        // Create temporary user if not exists
        $user = User::firstOrCreate(
            ['email' => $request->email],
            [
                'name' => 'Temp User',
                'password' => bcrypt(Str::random(12)),
            ]
        );

        // Rate limit OTP: 5 min
        if ($user->otp_expire_at && now()->lt($user->otp_expire_at)) {
            return response()->json(['error' => 'OTP already sent. Wait a few minutes.'], 429);
        }

        $otp = rand(100000, 999999);

        $user->update([
            'otp' => $otp,
            'otp_expire_at' => now()->addMinutes(5),
            'telegram_id' => $request->telegram_id,
            'telegram_username' => $request->telegram_username,
        ]);

        try {
            $telegram = new TelegramApi(env('TELEGRAM_BOT_TOKEN'));
            $telegram->sendMessage([
                'chat_id' => $request->telegram_id,
                'text' => "Your OTP is {$otp}\nUse /start in the bot if needed."
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to send Telegram message: ' . $e->getMessage()], 500);
        }

        return response()->json([
            'message' => 'OTP sent successfully',
            'otp' => $otp // useful for dev / testing
        ]);
    }

    // ---------------- Verify OTP ----------------
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|numeric',
            'name' => 'required|string|max:255',
            'password' => 'required|string|confirmed|min:6'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        if ($user->otp != $request->otp) {
            return response()->json(['error' => 'Invalid OTP'], 422);
        }

        if (now()->gt($user->otp_expire_at)) {
            return response()->json(['error' => 'OTP expired'], 422);
        }

        // Complete registration
        $user->update([
            'name' => $request->name,
            'password' => Hash::make($request->password),
            'otp' => null,
            'otp_expire_at' => null
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful',
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer'
        ], 201);
    }

    // ---------------- Login ----------------
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer'
        ]);
    }

    // ---------------- Logout ----------------
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    // ---------------- Get Authenticated User ----------------
    public function user(Request $request)
    {
        return response()->json($request->user());
    }
}