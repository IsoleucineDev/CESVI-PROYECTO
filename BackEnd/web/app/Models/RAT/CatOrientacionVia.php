<?php

namespace App\Models\RAT;

use Illuminate\Database\Eloquent\Model;

class CatOrientacionVia extends Model
{
    protected $table      = 'RAT_CAT_ORIENTACION_VIA';
    public    $timestamps = false;
    protected $fillable   = ['nombre'];
}
