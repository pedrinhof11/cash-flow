<?php

use App\Http\Controllers\Api\AccountController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BudgetController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\DebtController;
use App\Http\Controllers\Api\RecurringTransactionController;
use App\Http\Controllers\Api\TransactionController;
use Illuminate\Support\Facades\Route;

Route::get('/sanctum/csrf-cookie', function () {
    return response()->json(['message' => 'CSRF cookie set']);
});

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    Route::apiResource('accounts', AccountController::class);
    Route::get('/accounts/{account}/balance', [AccountController::class, 'balance']);

    Route::apiResource('categories', CategoryController::class)->except(['show']);

    Route::apiResource('transactions', TransactionController::class)->except(['show']);
    Route::get('/transactions/summary', [TransactionController::class, 'summary']);

    Route::apiResource('budgets', BudgetController::class)->except(['show']);
    Route::get('/budgets/current', [BudgetController::class, 'current']);

    Route::apiResource('recurring', RecurringTransactionController::class);
    Route::post('/recurring/{recurring}/skip', [RecurringTransactionController::class, 'skip']);

    Route::apiResource('debts', DebtController::class);
    Route::post('/debts/calculate', [DebtController::class, 'calculate']);
});
