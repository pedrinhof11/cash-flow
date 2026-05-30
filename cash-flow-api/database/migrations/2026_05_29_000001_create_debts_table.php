<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('debts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('creditor');
            $table->decimal('total_amount', 15, 2);
            $table->decimal('interest_rate', 5, 2);
            $table->decimal('minimum_payment', 15, 2);
            $table->decimal('paid_amount', 15, 2)->default(0);
            $table->integer('due_day');
            $table->date('start_date');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'due_day']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('debts');
    }
};
