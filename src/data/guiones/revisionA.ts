import type { AccionUI, ItemRevision, Vista } from '@/types/agentes';
import { anclaBoton } from '@/components/agentes/guion';
import type { CtxGuion, Guion, Guiones } from './tipos';

// E4a: v1, v2, s4, o2 (y variantes Datos_incompletos:v1 y Diferencia_llegada:o2)

/* ─── Anclas de la ventana «revision» que usan estos guiones ─── */
const BTN_APROBAR = 'revision.btn.aprobar';
const BTN_DEVOLVER = 'revision.btn.devolver';
const item = (id: string) => `revision.item.${id}`;

const r3 = (n: number) => Math.round(n * 1000) / 1000;
const ordenar = (ui: AccionUI[]): AccionUI[] => ui.map((a, i) => ({ a, i })).sort((x, y) => x.a.t - y.a.t || x.i - y.i).map(x => x.a);
const minuscula = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

/** Cada ítem se lee (mover) y se marca ✓/✗ (resaltar) uno tras otro entre `desde` y `hasta`. */
function recorrerItems(items: ItemRevision[], desde: number, hasta: number, textoOk: string, textoFallo: string): AccionUI[] {
  const paso = (hasta - desde) / items.length;
  const ui: AccionUI[] = [];
  items.forEach((it, i) => {
    const t0 = r3(desde + paso * i);
    const t1 = r3(t0 + paso * 0.7);
    ui.push(
      { t: t0, tipo: 'mover', ancla: item(it.id) },
      { t: t1, hasta: r3(Math.min(t1 + paso * 0.6, 0.99)), tipo: 'resaltar', ancla: item(it.id), texto: it.ok ? textoOk : textoFallo },
    );
  });
  return ui;
}

/* ═══════════════ v1 · Revisión de los 9 datos mínimos ═══════════════ */
const v1: Guion = ({ d }: CtxGuion) => {
  const items = d.datosMinimos;
  const fallan = items.filter(i => !i.ok);
  const bien = fallan.length === 0;
  const n = items.length;
  const ui: AccionUI[] = [
    { t: 0, tipo: 'estado', texto: `Revisando los ${n} datos mínimos de ${d.solicitud.referenciaCliente}…` },
    ...recorrerItems(items, 0.06, 0.78, 'Dato presente', 'Dato faltante'),
  ];
  let pensamiento: string;
  if (bien) {
    ui.push(
      { t: 0.8, tipo: 'mover', ancla: BTN_APROBAR },
      { t: 0.85, tipo: 'clic', ancla: BTN_APROBAR },
      { t: 0.88, hasta: 0.98, tipo: 'estado', texto: `${n} de ${n} datos presentes · solicitud suficiente para iniciar`, nivel: 'ok' },
    );
    pensamiento = `Reviso uno por uno los ${n} datos mínimos que dejó el cliente y los ${n} están completos: según R01 la solicitud ya basta para iniciar y la valido sin devolverla.`;
  } else {
    const faltan = fallan.map(f => minuscula(f.etiqueta)).join(', ');
    ui.push(
      { t: 0.8, tipo: 'mover', ancla: BTN_DEVOLVER },
      { t: 0.84, tipo: 'clic', ancla: BTN_DEVOLVER },
      { t: 0.86, hasta: 0.97, tipo: 'estado', texto: `Faltan ${fallan.length} de ${n} datos: ${faltan}`, nivel: 'error' },
      {
        t: 0.87, hasta: 0.975, tipo: 'dialogo',
        dialogo: {
          tipo: 'confirmar',
          titulo: 'Datos mínimos incompletos',
          cuerpo: `Faltan ${fallan.length} de ${n} datos: ${faltan}.\nNo se detiene la solicitud: se retoma con el cliente.`,
          botones: ['Programar gestión posterior con el cliente'],
          regla: 'R02',
        },
      },
      { t: 0.9, tipo: 'mover', ancla: anclaBoton('Programar gestión posterior con el cliente') },
      { t: 0.945, hasta: 0.955, tipo: 'clic', ancla: anclaBoton('Programar gestión posterior con el cliente') },
    );
    pensamiento = `Al revisar los ${n} datos mínimos faltan ${fallan.length} (${faltan}): por R01 la solicitud no está completa, pero por R02 no la detengo; registro la novedad y programo la gestión posterior con el cliente para completarla.`;
  }
  return { vista: 'revision.datos' as Vista, ui: ordenar(ui), pensamiento };
};

/* ═══════════════ v2 · Coherencia peso · volumen · vehículo ═══════════════ */
const v2: Guion = ({ d }: CtxGuion) => {
  const op = d.trayectoria[0];
  const peso = d.datosMinimos.find(i => i.id === 'peso');
  const ok = peso?.ok ?? true;
  const ui: AccionUI[] = [
    { t: 0, tipo: 'estado', texto: 'Comparando peso, volumen y vehículo requerido…' },
    { t: 0.06, tipo: 'mover', ancla: item('peso') },
    { t: 0.22, tipo: 'mover', ancla: item('volumen') },
    { t: 0.36, tipo: 'mover', ancla: item('vehiculo') },
    { t: 0.5, tipo: 'mover', ancla: item('coherencia') },
    { t: 0.76, hasta: 0.92, tipo: 'resaltar', ancla: item('coherencia'), texto: ok ? 'Dentro de la capacidad' : 'No verificable' },
    { t: 0.8, hasta: 0.98, tipo: 'estado', texto: ok ? 'Peso, volumen y vehículo son coherentes' : 'Coherencia no verificable: falta el peso', nivel: ok ? 'ok' : 'aviso' },
  ];
  return {
    vista: 'revision.datos' as Vista,
    ui: ordenar(ui),
    pensamiento: ok
      ? `Cruzo el peso y el volumen de la carga con el vehículo requerido (${op.vehiculoRequerido}) y todo cabe dentro de su capacidad; según R01 la solicitud es coherente y puede avanzar.`
      : `No puedo comprobar la coherencia porque falta el peso de la carga; por R01 queda pendiente hasta que el cliente lo informe.`,
  };
};

/* ═══════════════ s4 · Documentos del vehículo y del conductor ═══════════════ */
const s4: Guion = ({ d }: CtxGuion) => {
  const items = d.documentos;
  const fallan = items.filter(i => !i.ok);
  const bien = fallan.length === 0;
  const n = items.length;
  const ui: AccionUI[] = [
    { t: 0, tipo: 'estado', texto: `Revisando ${n} documentos del vehículo y del conductor…` },
    ...recorrerItems(items, 0.06, 0.8, 'Vigente', 'No vigente'),
  ];
  if (bien) {
    ui.push(
      { t: 0.82, tipo: 'mover', ancla: BTN_APROBAR },
      { t: 0.87, tipo: 'clic', ancla: BTN_APROBAR },
      { t: 0.9, hasta: 0.98, tipo: 'estado', texto: `${n} de ${n} documentos vigentes · DocumentosValidados`, nivel: 'ok' },
    );
  } else {
    ui.push(
      { t: 0.82, tipo: 'mover', ancla: BTN_DEVOLVER },
      { t: 0.87, tipo: 'clic', ancla: BTN_DEVOLVER },
      { t: 0.9, hasta: 0.98, tipo: 'estado', texto: `No vigente: ${fallan.map(f => f.etiqueta).join(', ')}`, nivel: 'error' },
    );
  }
  return {
    vista: 'revision.documentos' as Vista,
    ui: ordenar(ui),
    pensamiento: bien
      ? `Verifico uno por uno los ${n} documentos del vehículo y del conductor (licencia, SOAT, técnico-mecánica, propiedad, seguridad social y manifiesto): todos están vigentes, así que por R10 el servicio puede seguir.`
      : `Al verificar los ${n} documentos encuentro vencidos ${fallan.map(f => minuscula(f.etiqueta)).join(', ')}; por R10 no avanzo con este vehículo hasta tener la documentación al día.`,
  };
};

/* ═══════════════ o2 · Validación cruzada de llegada ═══════════════ */
function fabricaO2(forzarDiferencia: boolean): Guion {
  return ({ d }: CtxGuion) => {
    const x = d.cruceLlegada;
    const coincide = forzarDiferencia ? false : x.coincide;
    const ui: AccionUI[] = [
      { t: 0, tipo: 'estado', texto: `Cruzando lo reportado con lo observado · ${x.titulo}` },
      { t: 0.05, tipo: 'mover', ancla: item('transportador') },
      { t: 0.32, hasta: 0.38, tipo: 'resaltar', ancla: item('transportador'), texto: x.transportador.fuente },
      { t: 0.36, tipo: 'mover', ancla: item('cliente') },
      { t: 0.62, hasta: 0.68, tipo: 'resaltar', ancla: item('cliente'), texto: x.cliente.fuente },
      { t: 0.64, tipo: 'mover', ancla: item('veredicto') },
      { t: 0.8, hasta: 0.88, tipo: 'resaltar', ancla: item('veredicto'), texto: coincide ? 'Coincide' : 'Difiere' },
    ];
    let pensamiento: string;
    if (coincide) {
      ui.push(
        { t: 0.84, tipo: 'mover', ancla: BTN_APROBAR },
        { t: 0.9, tipo: 'clic', ancla: BTN_APROBAR },
        { t: 0.92, hasta: 0.99, tipo: 'estado', texto: `Coincide · ${x.detalle}`, nivel: 'ok' },
      );
      pensamiento = `Comparo lo que reporta el transportador con lo que observa el cliente: ambos dicen lo mismo, así que por R15 confirmo la llegada y sigo con el cargue.`;
    } else {
      ui.push(
        { t: 0.84, tipo: 'mover', ancla: BTN_DEVOLVER },
        { t: 0.88, tipo: 'clic', ancla: BTN_DEVOLVER },
        { t: 0.9, hasta: 0.99, tipo: 'estado', texto: `Difiere · ${x.detalle}`, nivel: 'error' },
        {
          t: 0.9, hasta: 0.985, tipo: 'dialogo',
          dialogo: {
            tipo: 'confirmar',
            titulo: 'Diferencia en la llegada',
            cuerpo: `${x.detalle}\nSe deja constancia y se pide evidencia antes de continuar.`,
            botones: ['Registrar la diferencia y pedir evidencia'],
            regla: 'R15',
          },
        },
        { t: 0.925, tipo: 'mover', ancla: anclaBoton('Registrar la diferencia y pedir evidencia') },
        { t: 0.955, hasta: 0.965, tipo: 'clic', ancla: anclaBoton('Registrar la diferencia y pedir evidencia') },
      );
      pensamiento = `El transportador dice haber llegado y el cliente no lo ve: por R15 no doy la llegada por buena; registro la diferencia, pido evidencia y dejo la novedad para decisión del coordinador.`;
    }
    return { vista: 'revision.cruzada' as Vista, ui: ordenar(ui), pensamiento };
  };
}

/** Guiones de la ventana «revision» (vistas datos, documentos y cruzada). */
export const revisionA: Guiones = {
  v1,
  'Datos_incompletos:v1': v1,
  v2,
  s4,
  o2: fabricaO2(false),
  'Diferencia_llegada:o2': fabricaO2(true),
};
