<?php

use App\Jobs\ProcessRecurringTransactions;
use Illuminate\Support\Facades\Schedule;

Schedule::job(new ProcessRecurringTransactions())
    ->dailyAt('00:00')
    ->withoutOverlapping()
    ->onOneServer();
