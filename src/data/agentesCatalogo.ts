// ============================================================================
// Catálogo de la pestaña Agentes: los 12 puestos, las ventanas del escritorio,
// las personas que deciden, los escenarios y las escenas del Director.
// Sin dependencias del plan ni de los datos (evita ciclos de importación).
// ============================================================================

import type { EtapaFlujo, TipoExcepcion } from '@/types';
import type { AgenteDef, AgenteId, Escena, Escenario, Humano, SistemaId } from '@/types/agentes';

/* ─── Agentes ─── */
export const AGENTES: AgenteDef[] = [
  { id: 'receptor', nombre: 'Agente Receptor', rol: 'Recibe la solicitud', etapa: '[1] Solicitud', familia: 'Agente de cliente', sistema: 'canal', sistemas: ['canal', 'voz', 'plataforma'], color: '#2563eb', descripcion: 'Atiende la llamada o lee el formulario, la integración o el registro del coordinador; recopila los datos mínimos.' },
  { id: 'validador', nombre: 'Agente Validador', rol: 'Valida la solicitud', etapa: '[2] Validación', familia: 'Agente de cliente', sistema: 'revision', sistemas: ['revision', 'voz', 'agenda'], color: '#3b82f6', descripcion: 'Revisa los 9 datos mínimos; si faltan, programa la gestión posterior con el cliente.' },
  { id: 'planeador', nombre: 'Agente de Planeación', rol: 'Registra y planea', etapa: '[3] Planeación', familia: 'Agente de cliente', sistema: 'plataforma', sistemas: ['plataforma', 'voz', 'agenda'], color: '#1d4ed8', descripcion: 'Registra la operación con identificador único y confirma cargue, acceso y horarios con el contacto autorizado.' },
  { id: 'buscador', nombre: 'Agente Buscador', rol: 'Busca transportadores', etapa: '[4] Búsqueda', familia: 'Sistema', sistema: 'proveedores', sistemas: ['proveedores'], color: '#0d9488', descripcion: 'Consulta la base de proveedores y preselecciona los candidatos más compatibles.' },
  { id: 'negociador', nombre: 'Agente Negociador', rol: 'Negocia la tarifa', etapa: '[5] Negociación', familia: 'Agente de negociación', sistema: 'voz', sistemas: ['voz', 'proveedores'], color: '#0f766e', descripcion: 'Llama a los candidatos, informa la tarifa y negocia sin superar el máximo autorizado.' },
  { id: 'asignador', nombre: 'Agente Asignador', rol: 'Selecciona y asigna', etapa: '[6]+[7] Selección y asignación', familia: 'Sistema', sistema: 'plataforma', sistemas: ['plataforma', 'revision'], color: '#14b8a6', descripcion: 'Consolida las ofertas, selecciona (automática o por el coordinador), valida documentos y formaliza la asignación.' },
  { id: 'confirmador', nombre: 'Agente Confirmador', rol: 'Confirma a ambas partes', etapa: '[8]+[9] Confirmación y preventivas', familia: 'Agente de seguimiento', sistema: 'voz', sistemas: ['voz', 'agenda', 'plataforma'], color: '#d97706', descripcion: 'Doble confirmación con cliente y transportador y llamadas preventivas antes del cargue.' },
  { id: 'origen', nombre: 'Agente de Origen', rol: 'Presentación y cargue', etapa: '[10]+[11] Presentación y cargue', familia: 'Agente de seguimiento', sistema: 'revision', sistemas: ['revision', 'voz'], color: '#b45309', descripcion: 'Validación cruzada de la llegada y control del cargue y del despacho.' },
  { id: 'seguimiento', nombre: 'Agente de Seguimiento', rol: 'Monitorea el tránsito', etapa: '[12] Tránsito', familia: 'Agente de seguimiento', sistema: 'tablero', sistemas: ['tablero', 'voz'], color: '#7c3aed', descripcion: 'Llamadas programadas al transportador; detecta y clasifica novedades; informa al cliente lo confirmado y lo estimado.' },
  { id: 'destino', nombre: 'Agente de Destino', rol: 'Aviso, descargue y entrega', etapa: '[13]+[14]+[15] Destino', familia: 'Agente de cliente', sistema: 'revision', sistemas: ['revision', 'voz'], color: '#6d28d9', descripcion: 'Prepara la recepción, sigue el descargue y cruza la entrega del transportador con la del cliente.' },
  { id: 'cierre', nombre: 'Agente de Cierre', rol: 'Cierre con el cliente', etapa: '[16]+[17] Cierre', familia: 'Agente de cliente', sistema: 'revision', sistemas: ['revision', 'voz', 'plataforma'], color: '#0891b2', descripcion: 'Llamada de cierre y cierre administrativo: documentos, condiciones económicas, costos adicionales y novedades.' },
  { id: 'torre', nombre: 'Agente Torre', rol: 'Expediente e historial', etapa: 'Trazabilidad transversal', familia: 'Sistema', sistema: 'expediente', sistemas: ['expediente'], color: '#475569', descripcion: 'Reúne solicitud, llamadas, transcripciones y soportes; ordena el historial y verifica la traza.' },
];

export const AGENTES_MAP: Record<AgenteId, AgenteDef> = Object.fromEntries(AGENTES.map((a) => [a.id, a])) as Record<AgenteId, AgenteDef>;

/** Agente que ejecuta cada etapa del flujo. */
export const ETAPA_AGENTE: Record<EtapaFlujo, AgenteId> = {
  Solicitud: 'receptor',
  Validacion: 'validador',
  Planeacion: 'planeador',
  Busqueda: 'buscador',
  Negociacion: 'negociador',
  Seleccion: 'asignador',
  Asignacion: 'asignador',
  Confirmacion: 'confirmador',
  Preventiva: 'confirmador',
  Presentacion: 'origen',
  Cargue: 'origen',
  Transito: 'seguimiento',
  AvisoDestino: 'destino',
  Descargue: 'destino',
  ValidacionEntrega: 'destino',
  LlamadaCierre: 'cierre',
  CierreAdmin: 'cierre',
};

/* ─── Ventanas del escritorio ─── */
export const SISTEMAS: Record<SistemaId, { nombre: string; color: string }> = {
  canal: { nombre: 'Bandeja de solicitudes', color: '#334155' },
  voz: { nombre: 'Consola de voz', color: '#4338ca' },
  plataforma: { nombre: 'Plataforma de coordinación', color: '#1e40af' },
  proveedores: { nombre: 'Base de proveedores', color: '#0f766e' },
  agenda: { nombre: 'Agenda centralizada', color: '#b45309' },
  revision: { nombre: 'Revisiones del proceso', color: '#475569' },
  tablero: { nombre: 'Tablero de seguimiento', color: '#0f172a' },
  mesa: { nombre: 'Mesa del coordinador', color: '#9f1239' },
  expediente: { nombre: 'Expediente e historial', color: '#334155' },
};

export function nombreSistema(id: SistemaId): string {
  return SISTEMAS[id].nombre;
}

/* ─── Personas que deciden fuera del software (nombres ficticios) ─── */
export const HUMANOS: Humano[] = [
  { nombre: 'Camila Restrepo', rol: 'Coordinadora logística', area: 'Logística', color: '#0f766e', firmaId: 'f1' },
  { nombre: 'Andrés Felipe Mora', rol: 'Coordinador logístico', area: 'Logística', color: '#b45309', firmaId: 'f2' },
  { nombre: 'Laura Cifuentes', rol: 'Coordinadora logística', area: 'Logística', color: '#6d28d9', firmaId: 'f3' },
  { nombre: 'Sergio Duarte', rol: 'Responsable comercial', area: 'Comercial', color: '#1d4ed8', firmaId: 'f2' },
  { nombre: 'Paola Giraldo', rol: 'Responsable de costos', area: 'Finanzas', color: '#9f1239', firmaId: 'f1' },
];

const POR_NOMBRE = (n: string): Humano => HUMANOS.find((h) => h.nombre === n)!;

const APROBADOR: Record<TipoExcepcion, string> = {
  Datos_incompletos: 'Camila Restrepo',
  Sin_respuesta: 'Camila Restrepo',
  Tarifa_sobre_tope: 'Paola Giraldo',
  Sin_transportador: 'Sergio Duarte',
  Seleccion_manual: 'Camila Restrepo',
  Mercancia_no_lista: 'Andrés Felipe Mora',
  Retraso_transportador: 'Andrés Felipe Mora',
  Diferencia_llegada: 'Andrés Felipe Mora',
  Espera_en_cargue: 'Andrés Felipe Mora',
  Diferencia_despacho: 'Andrés Felipe Mora',
  Novedad_en_ruta: 'Camila Restrepo',
  Conductor_ocupado: 'Camila Restrepo',
  Destinatario_no_recibe: 'Laura Cifuentes',
  Demora_en_descargue: 'Laura Cifuentes',
  Diferencia_entrega: 'Laura Cifuentes',
  Inconformidad_cliente: 'Sergio Duarte',
  Sobrecosto_liquidacion: 'Paola Giraldo',
};

export function humanoPara(tipo: TipoExcepcion): Humano {
  return POR_NOMBRE(APROBADOR[tipo]);
}

/* ─── Escenarios ─── */
export const ESCENARIO_LABEL: Record<Escenario, string> = {
  feliz: 'Flujo normal (selección automática)',
  feliz_manual: 'Flujo normal (selección por el coordinador)',
  Datos_incompletos: 'Datos incompletos',
  Sin_respuesta: 'Contacto no exitoso',
  Tarifa_sobre_tope: 'Tarifa sobre el tope',
  Sin_transportador: 'Sin transportador',
  Seleccion_manual: 'Selección por el coordinador',
  Mercancia_no_lista: 'Mercancía no lista',
  Retraso_transportador: 'Retraso del transportador',
  Diferencia_llegada: 'Diferencia en la llegada',
  Espera_en_cargue: 'Espera en el cargue',
  Diferencia_despacho: 'Diferencia en el despacho',
  Novedad_en_ruta: 'Novedad en ruta',
  Conductor_ocupado: 'Conductor conduciendo',
  Destinatario_no_recibe: 'Destinatario no recibe',
  Demora_en_descargue: 'Demora en el descargue',
  Diferencia_entrega: 'Diferencia en la entrega',
  Inconformidad_cliente: 'Inconformidad del cliente',
  Sobrecosto_liquidacion: 'Sobrecosto en la liquidación',
  cancelada: 'Servicio cancelado',
  consulta_entrante: 'Consulta entrante del cliente',
};

/** Novedad que materializa cada escenario (null = flujo normal). */
export function excepcionDelEscenario(e: Escenario): TipoExcepcion | null {
  if (e === 'feliz' || e === 'feliz_manual' || e === 'consulta_entrante') return null;
  if (e === 'cancelada') return 'Sin_transportador';
  return e;
}

/** Etapa del flujo donde ocurre la novedad de cada escenario. */
export const ETAPA_DE_NOVEDAD: Record<TipoExcepcion, EtapaFlujo> = {
  Datos_incompletos: 'Validacion',
  Sin_respuesta: 'Preventiva',
  Tarifa_sobre_tope: 'Negociacion',
  Sin_transportador: 'Busqueda',
  Seleccion_manual: 'Seleccion',
  Mercancia_no_lista: 'Preventiva',
  Retraso_transportador: 'Preventiva',
  Diferencia_llegada: 'Presentacion',
  Espera_en_cargue: 'Cargue',
  Diferencia_despacho: 'Cargue',
  Novedad_en_ruta: 'Transito',
  Conductor_ocupado: 'Transito',
  Destinatario_no_recibe: 'AvisoDestino',
  Demora_en_descargue: 'Descargue',
  Diferencia_entrega: 'ValidacionEntrega',
  Inconformidad_cliente: 'LlamadaCierre',
  Sobrecosto_liquidacion: 'CierreAdmin',
};

/* ─── Escenas del Director (21) ─── */
export const ESCENAS: Escena[] = [
  { id: 'feliz_llamada', etiqueta: 'Flujo normal · llamada atendida por IA', sinopsis: 'La solicitud entra por llamada y la operación llega al cierre administrativo sin novedades, con selección automática.', canal: 'llamada_ia', escenario: 'feliz', fin: 'Cerrada' },
  { id: 'feliz_manual', etiqueta: 'Flujo normal · selección por el coordinador', sinopsis: 'Solicitud por formulario; con la selección automática apagada, el coordinador elige entre las ofertas consolidadas.', canal: 'formulario', escenario: 'feliz_manual', categoria: 'asistido', regla: 'R09', fin: 'Cerrada' },
  { id: 'datos_incompletos', etiqueta: 'Datos incompletos', sinopsis: 'El cliente no tiene todos los datos al llamar: el agente registra lo confirmado y vuelve a llamar para completarlos.', canal: 'llamada_ia', escenario: 'Datos_incompletos', categoria: 'automatico', regla: 'R01 · R02', fin: 'Cerrada' },
  { id: 'sin_respuesta', etiqueta: 'Contacto no exitoso', sinopsis: 'El contacto no contesta la llamada preventiva: se registra el intento y se reprograma (R29).', escenario: 'Sin_respuesta', categoria: 'automatico', regla: 'R29', fin: 'Cerrada' },
  { id: 'tarifa_sobre_tope', etiqueta: 'Tarifa sobre el tope', sinopsis: 'El transportador pide más del máximo autorizado: el agente no compromete valores y decide el responsable de costos.', escenario: 'Tarifa_sobre_tope', categoria: 'humano', regla: 'R06 · R07 · R08', fin: 'Cerrada' },
  { id: 'sin_transportador', etiqueta: 'Sin transportador', sinopsis: 'Nadie acepta dentro de lo previsto: coordinación con el cliente y autorización del responsable.', escenario: 'Sin_transportador', categoria: 'humano', regla: 'R08', fin: 'Cerrada' },
  { id: 'seleccion_manual', etiqueta: 'Selección por el coordinador', sinopsis: 'Las ofertas se consolidan y la persona selecciona la más conveniente.', escenario: 'Seleccion_manual', categoria: 'asistido', regla: 'R09', fin: 'Cerrada' },
  { id: 'mercancia_no_lista', etiqueta: 'Mercancía no lista', sinopsis: 'En la llamada preventiva el cliente avisa que no estará lista: el coordinador autoriza la reprogramación.', escenario: 'Mercancia_no_lista', categoria: 'asistido', regla: 'R13', fin: 'Cerrada' },
  { id: 'retraso_transportador', etiqueta: 'Retraso del transportador', sinopsis: 'El transportador no alcanza el horario: se consulta margen de espera sin confirmar cambios definitivos.', escenario: 'Retraso_transportador', categoria: 'asistido', regla: 'R14', fin: 'Cerrada' },
  { id: 'diferencia_llegada', etiqueta: 'Diferencia en la llegada', sinopsis: 'El transportador dice que llegó y el cliente no lo ve: la validación cruzada lo detecta.', escenario: 'Diferencia_llegada', categoria: 'asistido', regla: 'R15', fin: 'Cerrada' },
  { id: 'espera_en_cargue', etiqueta: 'Espera en el cargue', sinopsis: 'El vehículo espera más del parámetro: se consulta la causa y se avisa al coordinador.', escenario: 'Espera_en_cargue', categoria: 'asistido', regla: 'R16', fin: 'Cerrada' },
  { id: 'diferencia_despacho', etiqueta: 'Diferencia en el despacho', sinopsis: 'Las unidades cargadas no coinciden con la solicitud: se registra antes de continuar.', escenario: 'Diferencia_despacho', categoria: 'asistido', regla: 'R17', fin: 'Cerrada' },
  { id: 'novedad_en_ruta', etiqueta: 'Novedad en ruta', sinopsis: 'Cierre vial o avería: el agente clasifica, informa lo confirmado y lo estimado, y el coordinador decide.', escenario: 'Novedad_en_ruta', categoria: 'asistido', regla: 'R19', fin: 'Cerrada' },
  { id: 'conductor_ocupado', etiqueta: 'Conductor conduciendo', sinopsis: 'El conductor contesta manejando: el agente cierra y reprograma la llamada (R18).', escenario: 'Conductor_ocupado', categoria: 'automatico', regla: 'R18', fin: 'Cerrada' },
  { id: 'destinatario_no_recibe', etiqueta: 'Destinatario no recibe', sinopsis: 'No pueden recibir en el horario previsto: cambios de horario o destino siguen las autorizaciones (R22).', escenario: 'Destinatario_no_recibe', categoria: 'humano', regla: 'R22', fin: 'Cerrada' },
  { id: 'demora_en_descargue', etiqueta: 'Demora en el descargue', sinopsis: 'Fila o acceso en destino: se identifica la causa y el impacto.', escenario: 'Demora_en_descargue', categoria: 'asistido', regla: 'R16', fin: 'Cerrada' },
  { id: 'diferencia_entrega', etiqueta: 'Diferencia en la entrega', sinopsis: 'Transportador y cliente no coinciden: el sistema no cierra y el coordinador pide evidencias (R23).', escenario: 'Diferencia_entrega', categoria: 'asistido', regla: 'R23', fin: 'Cerrada' },
  { id: 'inconformidad_cliente', etiqueta: 'Inconformidad del cliente', sinopsis: 'En la llamada de cierre el cliente expresa una inconformidad: se convierte en caso de seguimiento (R24).', escenario: 'Inconformidad_cliente', categoria: 'asistido', regla: 'R24', fin: 'Cerrada' },
  { id: 'sobrecosto_liquidacion', etiqueta: 'Sobrecosto en la liquidación', sinopsis: 'Costos adicionales sin autorización previa: el cierre espera al responsable (R25).', escenario: 'Sobrecosto_liquidacion', categoria: 'humano', regla: 'R25', fin: 'Cerrada' },
  { id: 'cancelada', etiqueta: 'Servicio cancelado', sinopsis: 'Sin transportador y sin acuerdo con el cliente: el responsable cancela el servicio (R28).', escenario: 'cancelada', categoria: 'humano', regla: 'R28', fin: 'Cancelada' },
  { id: 'consulta_entrante', etiqueta: 'Consulta entrante del cliente', sinopsis: 'El cliente llama por el estado: el agente valida su autorización e informa el último avance confirmado (R20).', escenario: 'consulta_entrante', categoria: 'automatico', regla: 'R20', fin: 'Cerrada' },
];
