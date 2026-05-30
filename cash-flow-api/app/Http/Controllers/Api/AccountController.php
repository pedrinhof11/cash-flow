<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAccountRequest;
use App\Http\Requests\UpdateAccountRequest;
use App\Http\Resources\AccountResource;
use App\DTOs\CreateAccountDTO;
use App\Models\Account;
use App\UseCases\AccountUseCase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AccountController extends Controller
{
    public function __construct(
        private AccountUseCase $useCase,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = array_filter([
            'type' => $request->type,
            'active_only' => $request->boolean('active_only'),
        ]);

        $accounts = $this->useCase->list($request->user()->id, $filters);

        return response()->json(['accounts' => AccountResource::collection(collect($accounts))]);
    }

    public function store(StoreAccountRequest $request): JsonResponse
    {
        $dto = CreateAccountDTO::fromRequest($request->validated(), $request->user()->id);
        $account = $this->useCase->create($dto);

        return response()->json(['account' => new AccountResource($account)], 201);
    }

    public function show(Request $request, Account $account): JsonResponse
    {
        if ($account->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized access to account');
        }

        $dto = $this->useCase->find($account->id);

        return response()->json(['account' => new AccountResource($dto)]);
    }

    public function update(UpdateAccountRequest $request, Account $account): JsonResponse
    {
        if ($account->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized access to account');
        }

        $result = $this->useCase->update($account->id, $request->validated());

        return response()->json(['account' => new AccountResource($result)]);
    }

    public function destroy(Request $request, Account $account): JsonResponse
    {
        if ($account->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized access to account');
        }

        if ($this->useCase->hasTransactions($account->id)) {
            return response()->json([
                'message' => 'Cannot delete account with transactions',
            ], 422);
        }

        $this->useCase->delete($account->id);

        return response()->json(['message' => 'Account deleted successfully']);
    }

    public function balance(Request $request, Account $account): JsonResponse
    {
        if ($account->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized access to account');
        }

        $result = $this->useCase->getBalance($account->id);

        return response()->json($result);
    }
}
