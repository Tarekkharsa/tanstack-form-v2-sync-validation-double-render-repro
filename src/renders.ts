export type FieldKey = 'plain' | 'fn' | 'schema'
export type Version = 'v1' | 'v2'

declare global {
  interface Window {
    __renders: Record<Version, Record<FieldKey, number>>
  }
}

window.__renders = {
  v1: { plain: 0, fn: 0, schema: 0 },
  v2: { plain: 0, fn: 0, schema: 0 },
}

export function countRender(version: Version, field: FieldKey) {
  window.__renders[version][field] += 1
}

export const LABELS: Record<FieldKey, string> = {
  plain: 'no validator',
  fn: 'sync function validator',
  schema: 'sync Standard Schema validator',
}
