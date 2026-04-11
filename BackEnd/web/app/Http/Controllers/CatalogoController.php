<?php

namespace App\Http\Controllers;

use App\Models\CatEntorno;
use Illuminate\Http\Request;

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
        $validated = $request->validate([
            'clima' => 'required|in:soleado,nublado,lluvia_ligera,lluvia_fuerte,niebla,granizo,nieve,otro',
            'tipo_via' => 'required|in:autopista,carretera_federal,carretera_estatal,avenida,calle,callejón,otro',
            'superficie' => 'required|in:asfalto,concreto,terracería,grava,adoquín,otro',
            'iluminacion' => 'required|in:diurna,nocturna_iluminada,nocturna_sin_iluminar,atardecer',
            'visibilidad' => 'required|in:excelente,buena,regular,mala,muy_mala',
            'observaciones' => 'nullable|string'
        ]);

        $catalogo = CatEntorno::create($validated);
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
        $validated = $request->validate([
            'clima' => 'in:soleado,nublado,lluvia_ligera,lluvia_fuerte,niebla,granizo,nieve,otro',
            'tipo_via' => 'in:autopista,carretera_federal,carretera_estatal,avenida,calle,callejón,otro',
            'superficie' => 'in:asfalto,concreto,terracería,grava,adoquín,otro',
            'iluminacion' => 'in:diurna,nocturna_iluminada,nocturna_sin_iluminar,atardecer',
            'visibilidad' => 'in:excelente,buena,regular,mala,muy_mala',
            'observaciones' => 'nullable|string'
        ]);

        $catalogo->update($validated);
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
