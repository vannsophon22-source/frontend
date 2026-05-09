<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('units', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained()->onDelete('cascade');
        
            $table->string('name'); // Entire place, Room A, Suite
            $table->enum('type', ['entire_place', 'private_room', 'shared_room']);
        
            $table->integer('capacity');
            $table->decimal('price_per_night', 10, 2);
        
            $table->integer('total_units')->default(1);
            $table->integer('available_units')->default(1);
        
            $table->boolean('is_active')->default(true);
        
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('units');
    }
};
