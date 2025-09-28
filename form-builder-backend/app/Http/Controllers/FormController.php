<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Form;
use Illuminate\Support\Facades\Log;

class FormController extends Controller
{
    public function store(Request $request)
    {
        Log::info('Received form submission request', $request->all());
        
        $request->validate([
            'title' => 'required|string|max:255',
            'fields' => 'required|array',
        ]);

        $form = Form::create(['title' => $request->title]);

        foreach ($request->fields as $index => $field) {
            $form->fields()->create([
                'type' => $field['type'],
                'label' => $field['label'],
                'required' => $field['required'] ?? false,
                'options' => $field['options'] ?? null,
                'order' => $index,
            ]);
        }

        return response()->json(['message' => 'Form saved successfully', 'form' => $form->load('fields')]);
    }

    public function index()
    {
        return Form::with('fields')->get();
    }

    public function destroy(Form $form)
    {
        $form->fields()->delete(); // Delete related fields first
        $form->delete(); // Then delete the form
        return response()->json(['message' => 'Form deleted successfully']);
    }
}
