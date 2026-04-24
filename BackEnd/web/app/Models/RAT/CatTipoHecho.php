<?php

namespace App\Models\RAT;

use Illuminate\Database\Eloquent\Model;

class CatTipoHecho extends Model
{
    protected $table      = 'RAT_CAT_TIPO_HECHO';
    public    $timestamps = false;
    protected $fillable   = ['nombre'];
}
