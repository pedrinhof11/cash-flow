<?php

namespace App\Jobs;

use App\Services\RecurringTransactionService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class ProcessRecurringTransactions implements ShouldQueue
{
    use Queueable;

    public function __construct()
    {
    }

    public function handle(RecurringTransactionService $service): void
    {
        Log::info('Processing recurring transactions...');

        $processed = $service->processDueTransactions();

        Log::info("Processed {$processed} recurring transactions");
    }
}
