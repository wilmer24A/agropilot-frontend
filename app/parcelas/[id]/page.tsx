"use client";
export const instant = false;
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

interface Lectura {
  fecha: string;
  ndvi: number;
  prioridad: string;
  recomendacion: string;
}

interface Parcela {
  id: string;
  nombre: string;
  cultivo: string;
  hectareas: number;
  lat: number;
  lon: number;
  email_agricultor: string;
}

const COLORES: Record<string, string> = {
  "CRÍTICA": "text-red-600",
  "ALTA": "text-amber-600",
  "MEDIA": "text-yellow-600",
  "NORMAL": "text-green-600",
};

function GraficaNDVI({ lecturas }: { lecturas: Lectura[] }) {
  if (lecturas.length === 0) return null;
  const max = 1;
  const min = 0;
  const ancho = 580;
  const alto = 120;
  const pad = 20;

  const puntos = lecturas.slice().reverse().map((l, i) => {
    const x = pad + (i / Math.max(lecturas.length - 1, 1)) * (ancho - pad * 2);
    const y = alto - pad - ((l.ndvi - min) / (max - min)) * (alto - pad * 2);
    return { x, y, ndvi: l.ndvi, fecha: l.fecha, prioridad: l.prioridad };
  });

  const linea = puntos.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
      <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Tendencia NDVI</h3>
      <svg width="100%" viewBox={`0 0 ${ancho} ${alto}`}>
        <line x1={pad} y1={alto - pad} x2={ancho - pad} y2={alto - pad} stroke="#e5e7eb" strokeWidth="0.5" />
        <line x1={pad} y1={pad} x2={pad} y2={alto - pad} stroke="#e5e7eb" strokeWidth="0.5" />
        {[0.2, 0.4, 0.6, 0.8].map(v => {
          const y = alto - pad - (v / max) * (alto - pad * 2);
          return (
            <g key={v}>
              <line x1={pad} y1={y} x2={ancho - pad} y2={y} stroke="#f3f4f6" strokeWidth="0.5" />
              <text x={pad - 4} y={y + 4} fontSize="9" fill="#9ca3af" textAnchor="end">{v.toFixed(1)}</text>
            </g>
          );
        })}
        <path d={linea} fill="none" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {puntos.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill={p.prioridad === "CRÍTICA" ? "#E24B4A" : p.prioridad === "ALTA" ? "#EF9F27" : "#1D9E75"} />
            <text x={p.x} y={alto - 4} fontSize="9" fill="#9ca3af" textAnchor="middle">{p.fecha.slice(5)}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function DetalleParcela() {
  const { id } = useParams();
  const router = useRouter();
  const [parcela, setParcela] = useState<Parcela | null>(null);
  const [historial, setHistorial] = useState<Lectura[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const headers = { "X-API-Key": API_KEY || "" };
    Promise.all([
      fetch(`${API_URL}/parcelas/${id}`, { headers }).then(r => r.json()),
      fetch(`${API_URL}/parcelas/${id}/historial?semanas=8`, { headers }).then(r => r.json()),
    ]).then(([p, h]) => {
      setParcela(p);
      setHistorial(h);
    }).finally(() => setCargando(false));
  }, [id]);

  if (cargando) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500 text-sm">Cargando parcela...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3">
        <button onClick={() => router.push("/")} className="text-gray-400 hover:text-gray-600 text-sm">← Volver</button>
        <span className="font-medium text-gray-900">
          <span className="text-green-600">Agro</span>Pilot AI
        </span>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <h1 className="font-medium text-gray-900 text-lg">{parcela?.nombre}</h1>
          <p className="text-sm text-gray-500">{parcela?.cultivo} · {parcela?.hectareas} ha</p>
          <p className="text-xs text-gray-400 mt-1">{parcela?.lat}°N, {parcela?.lon}°E</p>
        </div>

        <GraficaNDVI lecturas={historial} />

        <div>
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Historial de lecturas</h2>
          <div className="space-y-2">
            {historial.map((l, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{l.fecha}</span>
                  <span className={`text-xs font-medium ${COLORES[l.prioridad] || "text-gray-500"}`}>{l.prioridad}</span>
                </div>
                <p className="text-xs text-gray-500">NDVI {l.ndvi}</p>
                {l.recomendacion && (
                  <p className="text-xs text-gray-600 mt-2 leading-relaxed">{l.recomendacion.slice(0, 150)}...</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}