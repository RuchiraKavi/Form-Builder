<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FormSubmission extends Model
{
    protected $fillable = ['form_id', 'responses'];

    protected $casts = [
        'responses' => 'array'
    ];

    public function form()
    {
        return $this->belongsTo(Form::class);
    }

    public function setResponsesAttribute($value)
    {
        $this->attributes['responses'] = is_array($value) ? json_encode($value) : $value;
    }

    public function getResponsesAttribute($value)
    {
        return json_decode($value, true);
    }
}