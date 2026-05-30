<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTransactionRequest;
use App\Http\Requests\UpdateTransactionRequest;
use App\Http\Resources\TransactionResource;
use App\DTOs\CreateTransactionDTO;
use App\Models\Transaction;
use App\UseCases\TransactionUseCase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function __construct(
        private TransactionUseCase $useCase,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = array_filter($request->only(['type', 'account_id', 'category_id', 'start_date', 'end_date', 'search', 'page', 'per_page']));

        $result = $this->useCase->list($request->user()->id, $filters);

        return response()->json($result);
    }

    public function store(StoreTransactionRequest $request): JsonResponse
    {
        $dto = CreateTransactionDTO::fromRequest($request->validated(), $request->user()->id);

        $transaction = $this->useCase->create($dto);

        return response()->json(['transaction' => new TransactionResource($transaction)], 201);
    }

    public function update(UpdateTransactionRequest $request, Transaction $transaction): JsonResponse
    {
        if ($transaction->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized access to transaction');
        }

        $result = $this->useCase->update($transaction->id, $request->validated());

        return response()->json(['transaction' => new TransactionResource($result)]);
    }

    public function destroy(Request $request, Transaction $transaction): JsonResponse
    {
        if ($transaction->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized access to transaction');
        }

        $this->useCase->delete($transaction);

        return response()->json(['message' => 'Transaction deleted successfully']);
    }

    public function summary(Request $request): JsonResponse
    {
        $startDate = $request->get('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->get('end_date', now()->endOfMonth()->toDateString());

        $result = $this->useCase->summary($request->user()->id, $startDate, $endDate);

        return response()->json($result);
    }
}
