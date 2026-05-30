<?php

namespace App\Actions;

use App\Models\RecurringTransaction;

class SkipRecurringTransactionAction
{
    public function execute(RecurringTransaction $recurring): RecurringTransaction
    {
        $nextDue = $recurring->calculateNextDue();

        $recurring->update(['next_due' => $nextDue]);

        if ($recurring->occurrences_left !== null) {
            $recurring->decrement('occurrences_left');
        }

        if ($recurring->shouldStopRecurring()) {
            $recurring->update(['is_active' => false]);
        }

        return $recurring->fresh();
    }
}
