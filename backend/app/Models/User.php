<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'gender',
        'avatar',
        'bio',
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
        'is_online' => 'boolean',
    ];

    /*
    |--------------------------------------------------------------------------
    | RELATIONSHIPS
    |--------------------------------------------------------------------------
    */

    // Telegram account (1 user = 1 telegram account)
    public function telegram()
    {
        return $this->hasOne(TelegramAccount::class);
    }

    // Sent messages
    public function sentMessages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    // Received messages
    public function receivedMessages()
    {
        return $this->hasMany(Message::class, 'receiver_id');
    }
    public function rooms()
{
    return $this->hasMany(Room::class, 'create by');
}

public function bookings()
{
    return $this->hasMany(Booking::class);
}

public function isAdmin()
{
    return $this->role === 'admin';
}

public function isOwner()
{
    return $this->role === 'owner';
}

public function isUser()
{
    return $this->role === 'user';
}
}