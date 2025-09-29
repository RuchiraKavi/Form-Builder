<?php

use App\Http\Controllers\FormController;
use App\Http\Controllers\FormSubmissionController;
use Illuminate\Support\Facades\Route;

Route::get('/test', function () {
    return response()->json(['message' => 'API is working']);
});

Route::prefix('forms')->group(function () {
    Route::get('/', [FormController::class, 'index']);
    Route::post('/', [FormController::class, 'store']);
    Route::get('/{form}', [FormController::class, 'show']);
    Route::put('/{form}', [FormController::class, 'update']);
    Route::delete('/{form}', [FormController::class, 'destroy']);
    Route::post('/{form}/submit', [FormSubmissionController::class, 'store']);
});

Route::get('/submissions', [FormSubmissionController::class, 'index']);
