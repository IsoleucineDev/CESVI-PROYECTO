<?php

namespace App\Models\RAT;

use Illuminate\Database\Eloquent\Model;

class CatCondicionPavimento extends Model
{
    protected $table      = 'RAT_CAT_CONDICION_PAVIMENTO';
    public    $timestamps = false;
    protected $fillable   = ['nombre'];
}
