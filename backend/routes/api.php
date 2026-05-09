<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\UserController;


use App\Http\Controllers\API\PropertyController;
use App\Http\Controllers\API\UnitController;
use App\Http\Controllers\API\BookingController;

/*
|--------------------------------------------------------------------------
| AUTH ROUTES (PUBLIC)
|--------------------------------------------------------------------------
*/
Route::post('/send-otp', [AuthController::class, 'sendOtp']);
Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/check-telegram', [AuthController::class, 'checkTelegram']);

/*
|--------------------------------------------------------------------------
| AUTH USER (PROTECTED)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/user', [AuthController::class, 'updateProfile']);

    Route::post('/user/avatar', [UserController::class, 'uploadAvatar']);
    Route::get('/user/avatar/{id}', [UserController::class, 'getAvatar']);

    // CHAT
    Route::get('/chat/users', [ChatController::class, 'users']);
    Route::get('/chat/messages/{id}', [ChatController::class, 'messages']);
    Route::post('/chat/send', [ChatController::class, 'send']);
    Route::put('/messages/read/{id}', [ChatController::class, 'markAsRead']);
    Route::get('/messages/unread', [ChatController::class, 'unreadMessages']);

    // USERS
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);

    Route::get('/properties', [PropertyController::class, 'index']);
Route::get('/properties/{id}', [PropertyController::class, 'show']);
Route::post('/properties', [PropertyController::class, 'store']);
Route::put('/properties/{id}', [PropertyController::class, 'update']);
Route::delete('/properties/{id}', [PropertyController::class, 'destroy']);
   // UNITS
   Route::get('/units/property/{id}', [UnitController::class, 'byProperty']);
   Route::post('/units', [UnitController::class, 'store']);
   Route::put('/units/{id}', [UnitController::class, 'update']);
   Route::delete('/units/{id}', [UnitController::class, 'destroy']);

    // BOOKINGS
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::post('/bookings/check-availability', [BookingController::class, 'checkAvailabilityApi']);
    Route::get('/bookings/my', [BookingController::class, 'userBookings']);
});