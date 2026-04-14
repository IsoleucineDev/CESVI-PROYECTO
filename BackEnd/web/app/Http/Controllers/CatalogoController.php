<?php

namespace App\Http\Controllers;

use App\Models\CatEntorno;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CatalogoController extends Controller
{
    // GET - Listar catálogo de entorno
    public function entorno()
    {
        $catalogos = CatEntorno::all();
        return response()->json([
            'success' => true,
            'data' => $catalogos
        ]);
    }

    // GET - Obtener un catálogo específico
    public function show($id)
    {
        $catalogo = CatEntorno::findOrFail($id);
        return response()->json([
            'success' => true,
            'data' => $catalogo
        ]);
    }

    // POST - Crear catálogo
	public function store(Request $request)
	{
    	$rules = [
        	'clima' => 'required|in:soleado,nublado,lluvia_ligera,lluvia_fuerte,niebla,granizo,nieve,otro',
        	'tipo_via' => 'required|in:autopista,carretera_federal,carretera_estatal,avenida,calle,callejón,otro',
        	'superficie' => 'required|in:asfalto,concreto,terracería,grava,adoquín,otro',
        	'iluminacion' => 'required|in:diurna,nocturna_iluminada,nocturna_sin_iluminar,atardecer',
        	'visibilidad' => 'required|in:excelente,buena,regular,mala,muy_mala',
        	'observaciones' => 'nullable|string'
   		];

    	$validator = Validator::make($request->all(), $rules);

    	if ($validator->fails()) {
        	return response()->json([
            	'success' => false,
            	'message' => 'Error de validación',
            	'errors' => $validator->errors()
        	], 422);
    	}

    	$catalogo = CatEntorno::create($validator->validated());

    	return response()->json([
        	'success' => true,
        	'message' => 'Catálogo creado exitosamente',
        	'data' => $catalogo
    	], 201);
	}


    // PUT - Actualizar catálogo
	public function update(Request $request, $id)
	{
    	$catalogo = CatEntorno::findOrFail($id);

    	$rules = [
        	'clima' => 'sometimes|in:soleado,nublado,lluvia_ligera,lluvia_fuerte,niebla,granizo,nieve,otro',
        	'tipo_via' => 'sometimes|in:autopista,carretera_federal,carretera_estatal,avenida,calle,callejón,otro',
        	'superficie' => 'sometimes|in:asfalto,concreto,terracería,grava,adoquín,otro',
        	'iluminacion' => 'sometimes|in:diurna,nocturna_iluminada,nocturna_sin_iluminar,atardecer',
        	'visibilidad' => 'sometimes|in:excelente,buena,regular,mala,muy_mala',
        	'observaciones' => 'nullable|string'
    	];

    	$validator = Validator::make($request->all(), $rules);

    	if ($validator->fails()) {
        	return response()->json([
            	'success' => false,
            	'message' => 'Error de validación',
            	'errors' => $validator->errors()
        	], 422);
    	}

    	$catalogo->update($validator->validated());

    	return response()->json([
        	'success' => true,
        	'message' => 'Catálogo actualizado exitosamente',
        	'data' => $catalogo
    	]);
	}

    // DELETE - Eliminar catálogo
    public function destroy($id)
    {
        $catalogo = CatEntorno::findOrFail($id);
        $catalogo->delete();
        return response()->json([
            'success' => true,
            'message' => 'Catálogo eliminado exitosamente'
        ]);
    }
}
