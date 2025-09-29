<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Form;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class FormController extends Controller
{
    // Store new form with fields
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'fields' => 'required|array',
            'fields.*.type' => 'required|string|in:text,textarea,checkbox,radio',
            'fields.*.label' => 'required|string|max:255',
            'fields.*.required' => 'boolean',
            'fields.*.options' => 'sometimes|array',
        ]);

        DB::beginTransaction();
        try {
            $form = Form::create(['title' => $request->title]);

            foreach ($request->fields as $index => $field) {
                $form->fields()->create([
                    'type' => $field['type'],
                    'label' => $field['label'],
                    'required' => (bool) ($field['required'] ?? false),
                    'options' => in_array($field['type'], ['checkbox', 'radio']) ? ($field['options'] ?? []) : [],
                    'order' => $index,
                ]);
            }

            DB::commit();
            return response()->json([
                'message' => 'Form saved successfully',
                'form' => $form->load('fields')
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to save form', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Failed to save form',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Get all forms
    public function index()
    {
        return Form::with('fields')->get();
    }

    // Get a single form
    public function show(Form $form)
    {
        return $form->load('fields');
    }

    // Update form and fields
    public function update(Request $request, Form $form)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'fields' => 'required|array',
            'fields.*.id' => 'sometimes|integer',
            'fields.*.type' => 'required|string|in:text,textarea,checkbox,radio',
            'fields.*.label' => 'required|string|max:255',
            'fields.*.required' => 'boolean',
            'fields.*.options' => 'sometimes|array',
        ]);

        DB::beginTransaction();
        try {
            // Update form title
            $form->update(['title' => $request->title]);

            $existingIds = $form->fields()->pluck('id')->toArray();
            $submittedIds = [];

            foreach ($request->fields as $index => $field) {
                if (!empty($field['id'])) {
                    // Update existing field
                    $formField = $form->fields()->find($field['id']);
                    if ($formField) {
                        $formField->update([
                            'type' => $field['type'],
                            'label' => $field['label'],
                            'required' => (bool) ($field['required'] ?? false),
                            'options' => in_array($field['type'], ['checkbox', 'radio']) ? ($field['options'] ?? []) : [],
                            'order' => $index,
                        ]);
                        $submittedIds[] = $formField->id;
                    }
                } else {
                    // Create new field
                    $newField = $form->fields()->create([
                        'type' => $field['type'],
                        'label' => $field['label'],
                        'required' => (bool) ($field['required'] ?? false),
                        'options' => in_array($field['type'], ['checkbox', 'radio']) ? ($field['options'] ?? []) : [],
                        'order' => $index,
                    ]);
                    $submittedIds[] = $newField->id;
                }
            }

            // Delete removed fields
            $fieldsToDelete = array_diff($existingIds, $submittedIds);
            if (!empty($fieldsToDelete)) {
                $form->fields()->whereIn('id', $fieldsToDelete)->delete();
            }

            DB::commit();
            $form->refresh()->load('fields');

            return response()->json([
                'message' => 'Form updated successfully',
                'form' => $form
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to update form', ['form_id' => $form->id, 'error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Failed to update form',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Delete a form with all fields
    public function destroy(Form $form)
    {
        DB::beginTransaction();
        try {
            $form->fields()->delete();
            $form->delete();
            DB::commit();
            return response()->json(['message' => 'Form deleted successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to delete form', ['form_id' => $form->id, 'error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Failed to delete form',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
