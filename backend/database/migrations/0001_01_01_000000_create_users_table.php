<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();

            // AUTH
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');

            // ROLE SYSTEM
            $table->enum('role', ['admin', 'owner', 'user'])->default('user');

            // PROFILE
            $table->string('avatar')->nullable();
            $table->enum('gender', ['male', 'female'])->nullable();
            $table->text('bio')->nullable();

            // OTP AUTH (temporary system)
            $table->string('otp')->nullable();
            $table->timestamp('otp_expire_at')->nullable();

            // ONLINE / CHAT SUPPORT (optional but useful)
            $table->timestamp('last_seen_at')->nullable();
            $table->boolean('is_online')->default(false);

            // LARAVEL DEFAULTS
            $table->rememberToken();
            $table->timestamps();
        });

        // TELEGRAM (separate table = correct design)
        Schema::create('telegram_accounts', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('telegram_id')->unique();
            $table->string('username')->nullable();

            $table->timestamps();
        });

        // PASSWORD RESET
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        // SESSIONS
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();

            $table->foreignId('user_id')->nullable()->index();

            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();

            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('telegram_accounts');
        Schema::dropIfExists('users');
    }
};