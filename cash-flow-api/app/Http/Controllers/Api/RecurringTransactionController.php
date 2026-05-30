<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRecurringTransactionRequest;
use App\Http\Requests\UpdateRecurringTransactionRequest;
use App\Http\Resources\RecurringTransactionResource;
use App\DTOs\CreateRecurringTransactionDTO;
use App\Models\Account;
use App\Models\RecurringTransaction;
use App\UseCases\RecurringTransactionUseCase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RecurringTransactionController extends Controller
{
    public function __construct(
        private RecurringTransactionUseCase $useCase,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = array_filter($request->only(['type', 'frequency']));
        if ($request->boolean('active_only')) {
            $filters['active_only'] = true;
        }

        $recurring = $this->useCase->list($request->user()->id, $filters);

        return response()->json([
            'recurring_transactions' => RecurringTransactionResource::collection(collect($recurring)),
        ]);
    }

    public function store(StoreRecurringTransactionRequest $request): JsonResponse
    {
        $account = Account::findOrFail($request->account_id);
        if ($account->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized access to account');
        }

        $dto = CreateRecurringTransactionDTO::fromRequest($request->validated(), $request->user()->id);
        $recurring = $this->useCase->create($dto);

        return response()->json([
            'recurring_transaction' => new RecurringTransactionResource($recurring),
        ], 201);
    }

    public function update(UpdateRecurringTransactionRequest $request, RecurringTransaction $recurring): JsonResponse
    {
        if ($recurring->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized access to recurring transaction');
        }

        $result = $this->useCase->update($recurring->id, $request->validated());

        return response()->json([
            'recurring_transaction' => new RecurringTransactionResource($result),
        ]);
    }

    public function destroy(Request $request, RecurringTransaction $recurring): JsonResponse
    {
        if ($recurring->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized access to recurring transaction');
        }

        $this->useCase->delete($recurring->id);

        return response()->json(['message' => 'Recurring transaction deleted successfully']);
    }

    public function skip(Request $request, RecurringTransaction $recurring): JsonResponse
    {
        if ($recurring->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized access to recurring transaction');
        }

        if (!$recurring->is_active) {
            return response()->json([
                'message' => 'Recurring transaction is not active',
            ], 422);
        }

        $result = $this->useCase->skip($recurring);

        return response()->json([
            'message' => 'Skipped successfully',
            'next_due' => $result->next_due?->toDateString(),
        ]);
    }
}
