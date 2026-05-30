<?php

namespace App\Providers;

use App\Contracts\AccountRepositoryInterface;
use App\Contracts\BudgetRepositoryInterface;
use App\Contracts\CategoryRepositoryInterface;
use App\Contracts\DebtRepositoryInterface;
use App\Contracts\RecurringTransactionRepositoryInterface;
use App\Contracts\TransactionRepositoryInterface;
use App\Repositories\EloquentAccountRepository;
use App\Repositories\EloquentBudgetRepository;
use App\Repositories\EloquentCategoryRepository;
use App\Repositories\EloquentDebtRepository;
use App\Repositories\EloquentRecurringTransactionRepository;
use App\Repositories\EloquentTransactionRepository;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(AccountRepositoryInterface::class, EloquentAccountRepository::class);
        $this->app->bind(CategoryRepositoryInterface::class, EloquentCategoryRepository::class);
        $this->app->bind(TransactionRepositoryInterface::class, EloquentTransactionRepository::class);
        $this->app->bind(BudgetRepositoryInterface::class, EloquentBudgetRepository::class);
        $this->app->bind(RecurringTransactionRepositoryInterface::class, EloquentRecurringTransactionRepository::class);
        $this->app->bind(DebtRepositoryInterface::class, EloquentDebtRepository::class);
    }

    public function boot(): void
    {
        //
    }
}
