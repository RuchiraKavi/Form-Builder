<?php

namespace App\Http\Controllers;

use App\Models\Form;
use App\Models\FormSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Exception;

class FormSubmissionController extends Controller
{
    public function store(Request $request, Form $form)
    {
        DB::beginTransaction();

        try {
            $request->validate([
                'responses' => 'required|array'
            ]);

            // Verify all required fields are present
            $requiredFields = $form->fields()->where('required', true)->get();

            foreach ($requiredFields as $field) {
                $response = $request->input("responses.{$field->id}");
                if (
                    $response === null ||
                    (is_array($response) && count($response) === 0) ||
                    (is_string($response) && trim($response) === '')
                ) {
                    DB::rollBack();
                    return response()->json([
                        'message' => "The field '{$field->label}' is required",
                        'field' => $field->label
                    ], 422);
                }
            }

            try {
                // Add error logging
                \Log::info('Attempting to create form submission', [
                    'form_id' => $form->id,
                    'responses' => $request->responses
                ]);

                $submission = $form->submissions()->create([
                    'form_id' => $form->id,
                    'responses' => $request->responses  // Model will handle JSON encoding
                ]);

                DB::commit();

                \Log::info('Form submission created successfully', [
                    'submission_id' => $submission->id
                ]);

                return response()->json([
                    'message' => 'Form submitted successfully',
                    'submission' => $submission
                ], 201);

            } catch (\Exception $e) {
                \Log::error('Failed to create form submission', [
                    'error' => $e->getMessage(),
                    'form_id' => $form->id,
                    'responses' => $request->responses
                ]);
                throw $e;
            }

        } catch (Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Failed to process form submission: ' . $e->getMessage(),
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function index()
    {
        $submissions = FormSubmission::with(['form.fields'])
            ->latest()
            ->get()
            ->map(function ($submission) {
                // Ensure responses is always an array
                $responses = is_array($submission->responses) ? $submission->responses : [];

                // Format the responses to match field IDs
                $formattedResponses = [];
                foreach ($submission->form->fields as $field) {
                    $fieldId = (string) $field->id;
                    $formattedResponses[$fieldId] = $responses[$fieldId] ??
                        ($field->type === 'checkbox' ? [] : '');
                }

                $submission->responses = $formattedResponses;
                return $submission;
            });

        return $submissions;
    }
}