<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBudgetRequest;
use App\Http\Requests\UpdateBudgetRequest;
use App\Http\Resources\BudgetResource;
use App\DTOs\CreateBudgetDTO;
use App\Models\Budget;
use App\Models\Category;
use App\UseCases\BudgetUseCase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BudgetController extends Controller
{
    public function __construct(
        private BudgetUseCase $useCase,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = array_filter($request->only(['category_id', 'period']));
        if ($request->boolean('current')) {
            $filters['current'] = true;
        }

        $budgets = $this->useCase->list($request->user()->id, $filters);

        return response()->json(['budgets' => BudgetResource::collection(collect($budgets))]);
    }

    public function store(StoreBudgetRequest $request): JsonResponse
    {
        $category = Category::findOrFail($request->category_id);
        if ($category->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized access to category');
        }

        $dto = CreateBudgetDTO::fromRequest($request->validated(), $request->user()->id);

        try {
            $budget = $this->useCase->create($dto);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json(['budget' => new BudgetResource($budget)], 201);
    }

    public function update(UpdateBudgetRequest $request, Budget $budget): JsonResponse
    {
        if ($budget->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized access to budget');
        }

        $result = $this->useCase->update($budget->id, $request->validated());

        return response()->json(['budget' => new BudgetResource($result)]);
    }

    public function destroy(Request $request, Budget $budget): JsonResponse
    {
        if ($budget->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized access to budget');
        }

        $this->useCase->delete($budget->id);

        return response()->json(['message' => 'Budget deleted successfully']);
    }

    public function current(Request $request): JsonResponse
    {
        $budgets = $this->useCase->current($request->user()->id);

        return response()->json(['budgets' => BudgetResource::collection(collect($budgets))]);
    }
}
