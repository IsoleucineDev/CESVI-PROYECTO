<?php

namespace App\Models\RAT;

use Illuminate\Database\Eloquent\Model;

class UserData extends Model
{
    protected $table      = 'sys_users';
    protected $primaryKey = 'id_user';

    protected $fillable = [
        'id_keycloak',
        'preferred_username',
        'email',
        'given_name',
        'family_name',
        'name',
        'status',
        'id_company',
        'id_rol',
    ];

    protected $hidden = [
        'password', // ✅ Agrega esto — nunca expongas el password en JSON
    ];

    protected $casts = [
        'status'     => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}