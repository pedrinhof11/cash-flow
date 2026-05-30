<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\DTOs\CreateCategoryDTO;
use App\Models\Category;
use App\UseCases\CategoryUseCase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function __construct(
        private CategoryUseCase $useCase,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = array_filter([
            'type' => $request->type,
            'parent_id' => $request->parent_id,
        ]);

        $categories = $this->useCase->list($request->user()->id, $filters);

        return response()->json(['categories' => CategoryResource::collection(collect($categories))]);
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $dto = CreateCategoryDTO::fromRequest($request->validated(), $request->user()->id);
        $category = $this->useCase->create($dto);

        return response()->json(['category' => new CategoryResource($category)], 201);
    }

    public function update(UpdateCategoryRequest $request, Category $category): JsonResponse
    {
        if ($category->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized access to category');
        }

        $result = $this->useCase->update($category->id, $request->validated());

        return response()->json(['category' => new CategoryResource($result)]);
    }

    public function destroy(Request $request, Category $category): JsonResponse
    {
        if ($category->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized access to category');
        }

        if ($this->useCase->hasTransactions($category->id)) {
            return response()->json([
                'message' => 'Cannot delete category with transactions',
            ], 422);
        }

        $this->useCase->delete($category->id);

        return response()->json(['message' => 'Category deleted successfully']);
    }
}
