<?php
namespace App\Http\Requests;

use Illuminate\Http\Request;

class LoginRequest
{
    public static function validate(Request $request): array
    {
        return [
            'username' => $request->input('username'),
            'password' => $request->input('password'),
        ];
    }

    public static function rules(): array
    {
        return [
            'username' => 'required|string',
            'password' => 'required|string|min:6',
        ];
    }
}

class CreateUserRequest
{
    public static function validate(Request $request): array
    {
        return [
            'id_user'            => $request->input('id_user'),
            'telefono'           => $request->input('telefono'),
            'cedula_profesional' => $request->input('cedula_profesional'),
            'especialidad'       => $request->input('especialidad'),
            'numero_empleado'    => $request->input('numero_empleado'),
            'calificacion'       => $request->input('calificacion'),
            'fecha_alta'         => $request->input('fecha_alta'),
        ];
    }

    public static function rules(): array
    {
        return [
            'id_user'            => 'required|integer',
            'telefono'           => 'nullable|string|max:20',
            'cedula_profesional' => 'nullable|string|max:30',
            'especialidad'       => 'nullable|string|max:200',
            'numero_empleado'    => 'nullable|string|max:30',
            'calificacion'       => 'nullable|numeric|min:0|max:5',
            'fecha_alta'         => 'nullable|date',
        ];
    }
}

class CreateSiniestroRequest
{
    public static function validate(Request $request): array
    {
        return [
            'uuid'              => $request->input('uuid'),
            'numero_siniestro'  => $request->input('numero_siniestro'),
            'fecha_hecho'       => $request->input('fecha_hecho'),
            'hora_hecho'        => $request->input('hora_hecho'),
            'tipo_hecho_id'     => $request->input('tipo_hecho_id'),
            'id_usuario_perito' => $request->input('id_usuario_perito'),
            'estado'            => $request->input('estado', 0),
        ];
    }

    public static function rules(): array
    {
        return [
            'uuid'              => 'required|uuid',
            'numero_siniestro'  => 'required|string|max:100',
            'fecha_hecho'       => 'required|date',
            'hora_hecho'        => 'nullable|date_format:H:i:s',
            'tipo_hecho_id'     => 'required|integer|exists:RAT_CAT_TIPO_HECHO,id',
            'id_usuario_perito' => 'required|integer',
            'estado'            => 'integer|in:0,1',
        ];
    }
}