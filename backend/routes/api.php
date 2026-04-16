<?php


use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PropertyController;

Route::post('/send-otp', [AuthController::class, 'sendOtp']);
Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/check-telegram', [AuthController::class, 'checkTelegram']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
});
Route::post('/messages', [MessageController::class, 'send']);

Route::middleware(['auth:sanctum', 'admin'])->get('/users', [UserController::class, 'index']);
Route::middleware(['auth:sanctum', 'admin'])->post('/users', [UserController::class, 'store']);
Route::middleware(['auth:sanctum', 'admin'])->put('/users/{id}', [UserController::class, 'update']);
Route::middleware(['auth:sanctum', 'admin'])->delete('/users/{id}', [UserController::class, 'destory']);


Route::middleware('auth:sanctum')->group(function () {

    Route::post('/properties', [PropertyController::class, 'store']);
    Route::get('/properties', [PropertyController::class, 'index']);
    Route::delete('/properties/{id}', [PropertyController::class, 'destroy']);

});