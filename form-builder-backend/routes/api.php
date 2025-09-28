<?php

use App\Http\Controllers\FormController;
use Illuminate\Support\Facades\Route;

Route::get('/test', function() {
    return response()->json(['message' => 'API is working']);
});

Route::post('/forms', [FormController::class, 'store']);
Route::get('/forms', [FormController::class, 'index']);
Route::delete('/forms/{form}', [FormController::class, 'destroy']);
