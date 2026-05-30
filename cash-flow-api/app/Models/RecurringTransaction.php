<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class RecurringTransaction extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'account_id',
        'category_id',
        'type',
        'amount',
        'description',
        'frequency',
        'day_of_month',
        'start_date',
        'end_date',
        'next_due',
        'occurrences',
        'occurrences_left',
        'is_active',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
        'next_due' => 'date',
        'is_active' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class, 'recurring_transaction_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeDueToday($query)
    {
        return $query->where('next_due', '<=', now()->toDateString())
                     ->where('is_active', true);
    }

    public function calculateNextDue()
    {
        $date = Carbon::parse($this->next_due);

        return match ($this->frequency) {
            'daily' => $date->addDay(),
            'weekly' => $date->addWeek(),
            'biweekly' => $date->addWeeks(2),
            'monthly' => $date->addMonth(),
            'yearly' => $date->addYear(),
        };
    }

    public function shouldStopRecurring()
    {
        if ($this->end_date && $this->next_due > $this->end_date) {
            return true;
        }

        if ($this->occurrences_left !== null && $this->occurrences_left <= 0) {
            return true;
        }

        return false;
    }
}
