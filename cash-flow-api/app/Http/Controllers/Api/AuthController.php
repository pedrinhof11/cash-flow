<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\UseCases\AuthUseCase;
use Illuminate\Http\JsonResponse;

class AuthController extends Controller
{
    public function __construct(
        private AuthUseCase $useCase,
    ) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $user = $this->useCase->register($request->validated());

        return response()->json(['user' => $user], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = $this->useCase->login($request->validated());

        return response()->json(['user' => $user]);
    }

    public function logout(): JsonResponse
    {
        $this->useCase->logout();

        return response()->json(['message' => 'Desconectado com sucesso']);
    }

    public function me(): JsonResponse
    {
        return response()->json(['user' => $this->useCase->me()]);
    }
}
