// ---------------------------------------------------------------------------
// Levantamiento compartido (Supabase)
//
// Si el proyecto tiene VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY, el
// levantamiento de la Ruta de implementación se guarda en la tabla
// `levantamientos` (ver supabase/schema.sql) y todos los que abran la app ven
// lo mismo. Si no hay credenciales, la app sigue funcionando solo con el
// guardado local del navegador.
// ---------------------------------------------------------------------------

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const URL_SUPABASE = import.meta.env.VITE_SUPABASE_URL as string | undefined
const LLAVE_SUPABASE = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

const TABLA = 'levantamientos'

const supabase: SupabaseClient | null =
  URL_SUPABASE && LLAVE_SUPABASE
    ? createClient(URL_SUPABASE, LLAVE_SUPABASE, { auth: { persistSession: false, autoRefreshToken: false } })
    : null

/** true cuando la app está conectada a un levantamiento compartido en la nube. */
export const LEVANTAMIENTO_COMPARTIDO = supabase !== null

export interface FilaLevantamiento<V = unknown> {
  proceso_id: string
  version: number
  vista: V
  actualizado_en: string
  actualizado_por: string | null
}

const COLUMNAS = 'proceso_id, version, vista, actualizado_en, actualizado_por'

export async function leerRemoto<V>(procesoId: string): Promise<FilaLevantamiento<V> | null> {
  if (!supabase) return null
  const { data, error } = await supabase.from(TABLA).select(COLUMNAS).eq('proceso_id', procesoId).maybeSingle()
  if (error) throw error
  return (data as FilaLevantamiento<V> | null) ?? null
}

export async function guardarRemoto<V>(
  procesoId: string,
  version: number,
  vista: V,
  actualizadoPor: string | null,
): Promise<FilaLevantamiento<V>> {
  if (!supabase) throw new Error('Levantamiento compartido no configurado')
  const { data, error } = await supabase
    .from(TABLA)
    .upsert(
      { proceso_id: procesoId, version, vista, actualizado_en: new Date().toISOString(), actualizado_por: actualizadoPor },
      { onConflict: 'proceso_id' },
    )
    .select(COLUMNAS)
    .single()
  if (error) throw error
  return data as FilaLevantamiento<V>
}

/** Avisa cada vez que alguien guarda el levantamiento del proceso. Devuelve la función para cancelar. */
export function suscribirRemoto<V>(procesoId: string, alCambiar: (fila: FilaLevantamiento<V>) => void): () => void {
  if (!supabase) return () => {}
  const cliente = supabase
  const canal = cliente
    .channel(`${TABLA}:${procesoId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: TABLA, filter: `proceso_id=eq.${procesoId}` },
      (payload) => {
        const fila = payload.new as Partial<FilaLevantamiento<V>>
        if (fila && fila.proceso_id === procesoId && fila.vista && fila.actualizado_en) alCambiar(fila as FilaLevantamiento<V>)
      },
    )
    .subscribe()
  return () => {
    void cliente.removeChannel(canal)
  }
}
