<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

use Laravel\Sanctum\HasApiTokens;
use Telegram\Bot\Laravel\Facades\Telegram;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name', 
        'email', 
        'password', 
        'role', 
        'gender',
        'otp',
        'otp_expire_at',
    ];

    protected $hidden = [
        'password', 
        'remember_token', 
        'otp',
        'otp_expire_at',
    ];

    protected $casts = [
        'otp_expire_at' => 'datetime',
    ];

    public function telegram()
    {
        return $this->hasOne(TelegramAccount::class);
    }

    public function telgram()
    {
        return $this->hasOne(TelegramAccount::class);
    }
}