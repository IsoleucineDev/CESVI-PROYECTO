<?php

namespace App\Models\RAT;

use Illuminate\Database\Eloquent\Model;

class CatNumeroMediciones extends Model
{
    protected $table      = 'RAT_CAT_NUMERO_MEDICIONES';
    public    $timestamps = false;
    protected $fillable   = ['nombre'];
}
