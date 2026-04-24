<?php

namespace App\Models;

use Illuminate\Auth\Authenticatable;
use Laravel\Lumen\Auth\Authorizable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Contracts\Auth\Access\Authorizable as AuthorizableContract;
use App\Models\Rat\PeritoPerfilModel;
use App\Models\Rat\Incidente;
use App\Models\Rat\Reporte;
use App\Models\Rat\Conclusion;
use App\Models\Rat\JwtToken;
use App\Models\Rat\AuditLog;
use App\Models\Rat\IaSolicitud;

class UserData extends Model implements AuthenticatableContract, AuthorizableContract
{
    use Authenticatable, Authorizable;

    protected $table = 'sys_users';

    protected $primaryKey = 'id_user';

    public $incrementing = true;

    protected $keyType = 'int';

    protected $fillable = [
        'id_user',
        'name',
        'email',
        'password',
        'code_activacion',
        'date_code_activacion',
        'id_keycloak',
        'id_company',
        'id_rol',
        'status',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'date_code_activacion' => 'datetime',
    ];

    public function peritoPerfil()
    {
        return $this->hasOne(PeritoPerfilModel::class, 'id_user', 'id_user');
    }

    public function incidentes()
    {
        return $this->hasMany(Incidente::class, 'id_usuario_perito', 'id_user');
    }

    public function reportes()
    {
        return $this->hasMany(Reporte::class, 'id_usuario_perito', 'id_user');
    }

    public function conclusionesValidadas()
    {
        return $this->hasMany(Conclusion::class, 'validado_por_id', 'id_user');
    }

    public function jwtTokens()
    {
        return $this->hasMany(JwtToken::class, 'user_id', 'id_user');
    }

    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class, 'user_id', 'id_user');
    }

    public function iaSolicitudes()
    {
        return $this->hasMany(IaSolicitud::class, 'user_id', 'id_user');
    }

    public function scopePeritos($query)
    {
        return $query->whereHas('peritoPerfil');
    }

    public function scopeActivos($query)
    {
        return $query->where('status', 'alta');
    }

    public function scopePorCompania($query, $idCompany)
    {
        return $query->where('id_company', $idCompany);
    }

    public function esPerito(): bool
    {
        return $this->peritoPerfil()->exists();
    }

    public function getNombrePeritoAttribute(): string
    {
        if ($this->esPerito() && $this->peritoPerfil->especialidad) {
            return "{$this->name} ({$this->peritoPerfil->especialidad})";
        }
        return $this->name;
    }

    public function getEstadisticasPeritoAttribute(): array
    {
        return [
            'total_incidentes' => $this->incidentes()->count(),
            'incidentes_abiertos' => $this->incidentes()->where('estado', 0)->count(),
            'incidentes_en_revision' => $this->incidentes()->where('estado', 1)->count(),
            'incidentes_finalizados' => $this->incidentes()->where('estado', 2)->count(),
            'reportes_emitidos' => $this->reportes()->where('estado', 2)->count(),
            'calificacion' => $this->peritoPerfil->calificacion ?? null,
        ];
    }

    public function codigoActivacionValido(): bool
    {
        if (!$this->code_activacion || !$this->date_code_activacion) {
            return false;
        }

        $expiryDays = env('ACTIVATION_CODE_EXPIRY_DAYS', 1);
        $activationDate = \Carbon\Carbon::parse($this->date_code_activacion);
        
        return !$activationDate->copy()->addDays($expiryDays)->isPast();
    }

    public function invalidarCodigoActivacion(): void
    {
        $this->update([
            'code_activacion' => '',
            'date_code_activacion' => null,
        ]);
    }
}