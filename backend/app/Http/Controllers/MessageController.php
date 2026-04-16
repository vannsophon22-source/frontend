<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Message;

class MessageController extends Controller
{
    public function send(Request $request)
    {
        $userId = 1;

$message = Message::create([
    'user_id' => $userId,
    'message' => $request->message,
]);    }
}