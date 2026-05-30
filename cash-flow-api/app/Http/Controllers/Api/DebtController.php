<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CalculateDebtRequest;
use App\Http\Requests\StoreDebtRequest;
use App\Http\Requests\UpdateDebtRequest;
use App\Http\Resources\DebtResource;
use App\DTOs\CreateDebtDTO;
use App\DTOs\DebtSimulationDTO;
use App\Models\Debt;
use App\UseCases\DebtUseCase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DebtController extends Controller
{
    public function __construct(
        private DebtUseCase $useCase,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $debts = $this->useCase->list($request->user()->id);
        return response()->json(['debts' => DebtResource::collection(collect($debts))]);
    }

    public function store(StoreDebtRequest $request): JsonResponse
    {
        $dto = CreateDebtDTO::fromRequest($request->validated(), $request->user()->id);
        $debt = $this->useCase->create($dto);
        return response()->json(['debt' => new DebtResource($debt)], 201);
    }

    public function show(Request $request, Debt $debt): JsonResponse
    {
        if ($debt->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $dto = $this->useCase->find($debt->id);
        return response()->json(['debt' => new DebtResource($dto)]);
    }

    public function update(UpdateDebtRequest $request, Debt $debt): JsonResponse
    {
        if ($debt->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $result = $this->useCase->update($debt->id, $request->validated());
        return response()->json(['debt' => new DebtResource($result)]);
    }

    public function destroy(Request $request, Debt $debt): JsonResponse
    {
        if ($debt->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $this->useCase->delete($debt->id);
        return response()->json(['message' => 'Debt deleted successfully']);
    }

    public function calculate(CalculateDebtRequest $request): JsonResponse
    {
        $dto = DebtSimulationDTO::fromRequest($request->validated());
        $result = $this->useCase->calculate($dto);
        return response()->json($result);
    }
}
