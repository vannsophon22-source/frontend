<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Property extends Model
{
    protected $fillable = ['owner_id','name','description','type','address','city','country','lat','lng','cover_image'];

    public function units()
    {
        return $this->hasMany(Unit::class);
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }
}