<?php

namespace App\Models\RAT;

use Illuminate\Database\Eloquent\Model;

class CatSenalamientoVertical extends Model
{
    protected $table      = 'RAT_CAT_SENALAMIENTO_VERTICAL';
    public    $timestamps = false;
    protected $fillable   = ['nombre'];
}
