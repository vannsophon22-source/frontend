<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TelegramAccount extends Model
{
    protected $fillable = [
        'users_id',
        'telegram_id',
        'username',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
