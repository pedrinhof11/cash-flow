<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Debt extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'creditor',
        'total_amount',
        'interest_rate',
        'minimum_payment',
        'paid_amount',
        'due_day',
        'start_date',
        'notes',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'interest_rate' => 'decimal:2',
        'minimum_payment' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'due_day' => 'integer',
        'start_date' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getRemainingAmountAttribute(): float
    {
        return max(0, $this->total_amount - $this->paid_amount);
    }

    public function getProgressAttribute(): float
    {
        if ($this->total_amount <= 0) {
            return 100;
        }
        return round(($this->paid_amount / $this->total_amount) * 100, 1);
    }
}
