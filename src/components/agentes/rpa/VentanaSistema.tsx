import { memo, type ReactNode } from 'react';
import { Lock, Minus, Square, X } from 'lucide-react';
import type { ActorUI, DatosCaso, Humano, NivelUI, PasoPlan, VentanaId, Vista } from '@/types/agentes';
import { dialogoActivo, estadoBarra, teclaActiva, toastsActivos } from '@/components/agentes/guion';
import { formatDuracion } from '@/components/agentes/helpers';
import { plural } from '@/data/agentesUtil';
import { AvatarHumano, Spinner } from '@/components/agentes/ui';
import type { Rect } from './tipos';
import { CROMO } from './cromo';
import DialogoSistema from './DialogoSistema';
import Toast from './Toast';
import BarraTeclasF from './BarraTeclasF';
import TeclaPulsada from './TeclaPulsada';

const FUENTE_CLASICA = 'Tahoma, "Segoe UI", system-ui, sans-serif';

const COLOR_NIVEL: Record<NivelUI, string> = {
  ok: '#059669',
  aviso: '#d97706',
  error: '#dc2626',
  info: '#334155',
};

export interface PropsVentanaSistema {
  ventana: VentanaId;
  /** Por defecto `CROMO[ventana].titulo`. */
  titulo?: string;
  vista: Vista;
  actor: ActorUI;
  /** Persona cuya pantalla se muestra cuando `actor === 'humano'`. */
  humano?: Humano;
  paso?: PasoPlan;
  /** Progreso del paso (0–1), ya pasado por `progresoEfectivo`. */
  progreso: number;
  sesion: DatosCaso['sesion'];
  /** Milisegundos simulados transcurridos (Snapshot.relojSim). */
  relojSim: number;
  medir?: (ancla: string) => Rect | undefined;
  /** Acento (agente o humano) para botones primarios y barras de progreso. */
  color?: string;
  /** Entidad y serie del certificado para el diálogo de firma (firma electrónica simulada). */
  certificador?: string;
  certificadoSerie?: string;
  children: ReactNode;
  /** Contenido adicional a la derecha de la barra de estado. */
  estadoExtra?: ReactNode;
  /** 'barra' (ERP clásico): el toast se incrusta en la barra de estado en vez de apilarse. */
  posicionToast?: 'arriba-derecha' | 'barra';
  /** URL completa de la barra de dirección (por defecto `CROMO[ventana].url`; puede extenderla con una ruta). */
  url?: string;
  /** Barra de estado 'escritorio': «{n} elementos». */
  elementos?: number;
  /** Pinta el chip de tecla dentro de la ventana (por defecto lo pinta CursorAgente; evita duplicarlo). */
  mostrarTecla?: boolean;
}

/** «Camila Suárez» → csuarez (usuario del sistema cuando opera un humano). */
function usuarioHumano(nombre: string): string {
  const partes = nombre.trim().split(/\s+/);
  const inicial = partes[0]?.[0] ?? '';
  const apellido = partes.length > 1 ? partes[1] : '';
  return `${inicial}${apellido}`.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/** Letra de acceso subrayada (menú clásico). */
function MenuItem({ texto, clasico }: { texto: string; clasico: boolean }) {
  if (!clasico) return <span className="px-1.5 hover:bg-black/5 rounded-sm">{texto}</span>;
  return (
    <span className="px-1.5">
      <span className="underline decoration-1 underline-offset-[1px]">{texto[0]}</span>
      {texto.slice(1)}
    </span>
  );
}

function BarraDireccion({ url, sufijo }: { url: string; sufijo?: string }) {
  return (
    <div className="h-5 shrink-0 flex items-center gap-1.5 px-2 bg-slate-100 border-b border-slate-200 text-[10px] text-slate-600">
      <span className="flex items-center gap-0.5 text-slate-400 select-none">
        <span className="w-4 text-center">‹</span>
        <span className="w-4 text-center">›</span>
        <span className="w-4 text-center">↻</span>
      </span>
      <div className="flex-1 min-w-0 h-[15px] flex items-center gap-1 px-1.5 rounded-sm bg-white border border-slate-200">
        <Lock className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
        <span className="truncate">
          <span className="text-slate-700">https://</span>
          <span className="text-slate-800">{url}</span>
          {sufijo && <span className="font-mono text-[9px] text-slate-500">{sufijo}</span>}
        </span>
      </div>
    </div>
  );
}

/**
 * Marco común de las ventanas del escritorio RPA: cinta de actor humano,
 * barra de título por tipo de cromo, barra de dirección o de menú, cuerpo
 * (children + diálogo + toasts), barra de teclas F (clásico) y barra de estado.
 * Todo lo reactivo (diálogo, toasts, estado, tecla) es función de `progreso`.
 */
function VentanaSistema({
  ventana, titulo, vista, actor, humano, paso, progreso, sesion, relojSim, medir, color, certificador, certificadoSerie,
  children, estadoExtra, posicionToast = 'arriba-derecha', url, elementos, mostrarTecla = false,
}: PropsVentanaSistema) {
  const c = CROMO[ventana];
  const clasico = c.tipo === 'clasico';
  const esHumano = actor === 'humano' && !!humano;
  const acento = color ?? (esHumano ? humano?.color ?? '#d97706' : c.barra);
  const usuario = esHumano && humano ? usuarioHumano(humano.nombre) : sesion.usuario;
  const urlBarra = url ?? c.url ?? '';
  // Si el guion pasa una URL que extiende la del sistema, el resto se pinta como sufijo (ruta dinamica).
  const sufijo = url && c.url && url.startsWith(c.url) && url !== c.url ? url.slice(c.url.length) : undefined;
  const urlSinCufe = sufijo !== undefined ? c.url ?? '' : urlBarra;

  const dialogo = dialogoActivo(paso, progreso);
  const toasts = toastsActivos(paso, progreso);
  const estado = estadoBarra(paso, progreso);
  const tecla = teclaActiva(paso, progreso);
  // Spinner solo mientras el paso avanza: a progreso 1 (paso terminado o estado final del escritorio)
  // un texto que termine en «…» no debe girar indefinidamente.
  const cargando = !!estado && progreso < 1 && /…$|\.\.\.$/.test(estado.texto);
  const hora = formatDuracion(relojSim);

  return (
    <div
      data-ancla={`ventana.${ventana}`}
      data-vista={vista}
      className="absolute inset-0 flex flex-col rounded-md overflow-hidden shadow-lg border border-slate-300 bg-white"
      style={clasico ? { fontFamily: FUENTE_CLASICA } : undefined}
    >
      {/* Cinta de actor humano */}
      {esHumano && humano && (
        <div
          data-ancla="ventana.cinta.humano"
          className="h-5 shrink-0 flex items-center gap-1.5 px-2 text-[10.5px] leading-none border-b whitespace-nowrap overflow-hidden"
          style={{ backgroundColor: '#fef3c7', borderColor: '#f59e0b', color: '#92400e' }}
        >
          <AvatarHumano nombre={humano.nombre} size={16} color={humano.color ?? '#d97706'} />
          <span className="truncate">
            Pantalla de <span className="font-semibold">{humano.nombre}</span> · {humano.rol} · fuera del software del agente · gestión humana
          </span>
        </div>
      )}

      {/* Barra de título */}
      <div
        className="h-[22px] shrink-0 flex items-center gap-1.5 px-2 text-white select-none"
        style={{ backgroundColor: c.barra, background: clasico ? `linear-gradient(90deg, ${c.barra}, #a6caf0)` : c.barra }}
      >
        <c.icono className="w-3 h-3 shrink-0 opacity-90" />
        <span className={`flex-1 min-w-0 truncate text-[11px] ${clasico ? 'font-bold' : 'font-semibold'}`}>{titulo ?? c.titulo}</span>
        <span className="flex items-center gap-1 text-white/70">
          {clasico ? (
            <>
              <span className="w-[13px] h-[12px] bg-[#ece9d8] text-black border border-t-white border-l-white border-b-slate-500 border-r-slate-500 flex items-center justify-center"><Minus className="w-2 h-2" /></span>
              <span className="w-[13px] h-[12px] bg-[#ece9d8] text-black border border-t-white border-l-white border-b-slate-500 border-r-slate-500 flex items-center justify-center"><Square className="w-[7px] h-[7px]" /></span>
              <span className="w-[13px] h-[12px] bg-[#ece9d8] text-black border border-t-white border-l-white border-b-slate-500 border-r-slate-500 flex items-center justify-center"><X className="w-2 h-2" /></span>
            </>
          ) : (
            <>
              <span className="w-[10px] h-[10px] flex items-center justify-center"><Minus className="w-2.5 h-2.5" /></span>
              <span className="w-[10px] h-[10px] flex items-center justify-center"><Square className="w-2 h-2" /></span>
              <span className="w-[10px] h-[10px] flex items-center justify-center"><X className="w-2.5 h-2.5" /></span>
            </>
          )}
        </span>
      </div>

      {/* Segunda fila: dirección (web) o menú (escritorio/clásico) */}
      {c.tipo === 'web' ? (
        <BarraDireccion url={urlSinCufe} sufijo={sufijo} />
      ) : (
        <div
          className={`h-[18px] shrink-0 flex items-center px-1 border-b select-none whitespace-nowrap overflow-hidden ${clasico ? 'text-[11px] text-black bg-[#ece9d8] border-slate-400' : 'text-[10.5px] text-slate-700 bg-slate-50 border-slate-200'}`}
        >
          {(c.menu ?? []).map(m => <MenuItem key={m} texto={m} clasico={clasico} />)}
        </div>
      )}

      {/* Cuerpo */}
      <div className="relative flex-1 min-h-0 overflow-hidden" style={{ backgroundColor: c.fondo }}>
        {children}
        {dialogo && paso && (
          <DialogoSistema
            accion={dialogo}
            progreso={progreso}
            tipoCromo={c.tipo}
            paso={paso}
            color={acento}
            medir={medir}
            firmaId={humano?.firmaId ?? paso.humano?.firmaId}
            certificador={certificador}
            certificadoSerie={certificadoSerie}
          />
        )}
        {toasts.length > 0 && posicionToast !== 'barra' && (
          <Toast acciones={toasts} progreso={progreso} paso={paso} posicion="arriba-derecha" />
        )}
        {mostrarTecla && tecla && paso && (
          <TeclaPulsada key={`${paso.id}-${tecla}`} tecla={tecla} clasico={clasico} />
        )}
      </div>

      {/* Teclas de función (clásico) */}
      {clasico && <BarraTeclasF activa={tecla} />}

      {/* Barra de estado */}
      <div
        data-ancla="ventana.estado"
        className={`h-[18px] shrink-0 flex items-center gap-2 px-2 text-[10px] leading-none whitespace-nowrap overflow-hidden ${clasico ? 'bg-[#ece9d8] text-black border-t border-t-slate-400' : 'bg-slate-50 text-slate-500 border-t border-slate-200'}`}
      >
        <span
          data-ancla="ventana.estado.texto"
          className={`flex items-center gap-1 min-w-0 flex-1 ${clasico ? 'px-1 border border-t-slate-500 border-l-slate-500 border-b-white border-r-white h-[14px]' : ''}`}
          style={{ color: estado ? COLOR_NIVEL[estado.nivel] : undefined }}
        >
          {cargando && <Spinner className="w-2.5 h-2.5 shrink-0" color={estado ? COLOR_NIVEL[estado.nivel] : undefined} />}
          <span className="truncate">{estado?.texto ?? (clasico ? 'Listo' : '')}</span>
        </span>

        {posicionToast === 'barra' && toasts.length > 0 && (
          <Toast acciones={toasts} progreso={progreso} paso={paso} posicion="barra" />
        )}
        {estadoExtra}

        <span className={`shrink-0 flex items-center gap-1 ${clasico ? 'text-[10px]' : 'text-[9.5px]'}`}>
          {clasico && (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              <span>Conectado</span>
              <span className="opacity-50">·</span>
              <span className="font-mono">{sesion.servidor}</span>
              <span className="opacity-50">·</span>
              <span>usuario <span className="font-mono">{usuario}</span></span>
              <span className="opacity-50">·</span>
              <span>terminal <span className="font-mono">{sesion.terminal}</span></span>
              <span className="opacity-50">·</span>
              <span className="font-mono tabular-nums">{hora}</span>
            </>
          )}
          {c.tipo === 'web' && (
            <>
              <span className="font-mono truncate max-w-[220px]">{urlSinCufe}</span>
              <span className="opacity-50">·</span>
              <Lock className="w-2.5 h-2.5 text-emerald-600" />
              <span>sesión segura</span>
              <span className="opacity-50">·</span>
              <span className="font-mono">{usuario}</span>
            </>
          )}
          {c.tipo === 'escritorio' && (
            <>
              {elementos !== undefined && (
                <>
                  <span>{plural(elementos, 'elemento')}</span>
                  <span className="opacity-50">·</span>
                </>
              )}
              <span className="font-mono">{usuario}</span>
              <span className="opacity-50">·</span>
              <span className="font-mono tabular-nums">{hora}</span>
            </>
          )}
        </span>
      </div>
    </div>
  );
}

export default memo(VentanaSistema);
