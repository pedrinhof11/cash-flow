<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Budget extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'category_id',
        'amount',
        'period',
        'start_date',
        'end_date',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function scopeCurrent($query)
    {
        $now = now();

        return $query->where(function ($q) use ($now) {
            $q->whereNull('end_date')
              ->orWhere('end_date', '>=', $now);
        })->where('start_date', '<=', $now);
    }

    public function getSpentAmount()
    {
        $query = Transaction::expense()
            ->where('category_id', $this->category_id)
            ->where('user_id', $this->user_id)
            ->whereBetween('date', [$this->start_date, $this->end_date ?? now()]);

        return $query->sum('amount');
    }

    public function getRemainingAmount()
    {
        return $this->amount - $this->getSpentAmount();
    }

    public function getPercentageUsed()
    {
        if ($this->amount == 0) {
            return 0;
        }

        return min(100, ($this->getSpentAmount() / $this->amount) * 100);
    }

    public function isOverBudget()
    {
        return $this->getSpentAmount() > $this->amount;
    }
}
