<?php

namespace App\Models\RAT;

use Illuminate\Database\Eloquent\Model;

class CatSentidoVialidad extends Model
{
    protected $table      = 'RAT_CAT_SENTIDO_VIALIDAD';
    public    $timestamps = false;
    protected $fillable   = ['nombre'];
}
