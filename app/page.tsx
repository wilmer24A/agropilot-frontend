"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

interface Parcela {
  id?: string;
  nombre: string;
  cultivo: string;
  hectareas: number;
  ndvi: number;
  prioridad: string;
  fecha_analisis: string;
  accion: string;
}

interface Dashboard {
  resumen: {
    total_parcelas: number;
    total_hectareas: number;
    urgente: number;
    atencion: number;
    bien: number;
  };
  urgente: Parcela[];
  atencion: Parcela[];
  bien: Parcela[];
}

function BadgePrioridad({ prioridad }: { prioridad: string }) {
  const colores: Record<string, string> = {
    "CRÍTICA": "bg-red-100 text-red-800",
    "ALTA": "bg-amber-100 text-amber-800",
    "MEDIA": "bg-yellow-100 text-yellow-800",
    "NORMAL": "bg-green-100 text-green-800",
  };
  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${colores[prioridad] || "bg-gray-100 text-gray-700"}`}>
      {prioridad}
    </span>
  );
}

function BarraNDVI({ ndvi, prioridad }: { ndvi: number; prioridad: string }) {
  const color = prioridad === "CRÍTICA" ? "bg-red-500" :
    prioridad === "ALTA" ? "bg-amber-500" : "bg-green-500";
  return (
    <div className="mt-2">
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${ndvi * 100}%` }} />
      </div>
      <p className="text-xs text-gray-400 mt-1">NDVI {ndvi}</p>
    </div>
  );
}

function TarjetaParcela({ parcela, urgente }: { parcela: Parcela; urgente: boolean }) {
  return (
    <div className={`bg-white rounded-xl border p-4 ${urgente ? "border-l-4 border-l-red-500" : "border-l-4 border-l-green-500"} border-gray-200`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-medium text-gray-900 text-sm">{parcela.nombre}</h3>
          <p className="text-xs text-gray-500">{parcela.cultivo} · {parcela.hectareas} ha</p>
        </div>
        <BadgePrioridad prioridad={parcela.prioridad} />
      </div>
      <BarraNDVI ndvi={parcela.ndvi} prioridad={parcela.prioridad} />
      {urgente && parcela.accion && (
        <p className="text-xs text-gray-600 mt-3 leading-relaxed border-t pt-3">
          {parcela.accion.slice(0, 180)}...
        </p>
      )}
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [datos, setDatos] = useState<Dashboard | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/dashboard`, {
      headers: { "X-API-Key": API_KEY || "" }
    })
      .then(r => r.json())
      .then(setDatos)
      .catch(() => setError("No se pudo conectar con la API"))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500 text-sm">Cargando parcelas...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-500 text-sm">{error}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <span className="font-medium text-gray-900">
          <span className="text-green-600">Agro</span>Pilot AI
        </span>
        {(datos?.resumen?.urgente ?? 0) > 0 && (
          <span className="text-xs bg-red-100 text-red-800 px-3 py-1 rounded-full font-medium">
  {datos?.resumen?.urgente ?? 0} alerta{(datos?.resumen?.urgente ?? 0) > 1 ? "s" : ""} urgente{(datos?.resumen?.urgente ?? 0) > 1 ? "s" : ""}
</span>
        )}
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Hectáreas</p>
            <p className="text-xl font-medium">{datos?.resumen?.total_hectareas} ha</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Urgente</p>
            <p className="text-xl font-medium text-red-600">{datos?.resumen?.urgente}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Sin problema</p>
            <p className="text-xl font-medium text-green-600">{datos?.resumen?.bien}</p>
          </div>
        </div>

        {datos?.urgente && datos.urgente.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Acción urgente hoy</h2>
            <div className="space-y-3">
              {datos.urgente.map((p, i) => <div key={i} onClick={() => router.push(`/parcelas/${p.id}`)} className="cursor-pointer"><TarjetaParcela parcela={p} urgente={true} /></div>)}
            </div>
          </div>
        )}

        {datos?.bien && datos.bien.length > 0 && (
          <div>
            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Sin problemas</h2>
            <div className="space-y-3">
              {datos.bien.map((p, i) => <div key={i} onClick={() => router.push(`/parcelas/${p.id}`)} className="cursor-pointer"><TarjetaParcela parcela={p} urgente={false} /></div>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}