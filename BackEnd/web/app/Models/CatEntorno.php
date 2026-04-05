<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CatEntorno extends Model
{
    protected $table = 'cat_entorno';
    protected $fillable = [
        'clima',
        'tipo_via',
        'superficie',
        'iluminacion',
        'visibilidad'
    ];
    public $timestamps = true;

    public function siniestros()
    {
        return $this->hasMany(Siniestro::class);
    }
}
