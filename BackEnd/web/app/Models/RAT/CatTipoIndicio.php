<?php

namespace App\Models\RAT;

use Illuminate\Database\Eloquent\Model;

class CatTipoIndicio extends Model
{
    protected $table      = 'RAT_CAT_TIPO_INDICIO';
    public    $timestamps = false;
    protected $fillable   = ['nombre'];
}
