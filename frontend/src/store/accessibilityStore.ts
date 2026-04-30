import { create } from 'zustand'

type ZoomLevel = 'normal' | 'large' | 'xlarge'

interface AccessibilityStore {
  zoom: ZoomLevel
  cycleZoom: () => void
}

const ZOOM_ORDER: ZoomLevel[] = ['normal', 'large', 'xlarge']
const ZOOM_SCALE: Record<ZoomLevel, number> = { normal: 1, large: 1.15, xlarge: 1.3 }
const ZOOM_LABEL: Record<ZoomLevel, string> = { normal: '100%', large: '115%', xlarge: '130%' }

const getInitialZoom = (): ZoomLevel => {
  const saved = localStorage.getItem('a11y-zoom') as ZoomLevel | null
  if (saved && ZOOM_ORDER.includes(saved)) return saved
  return 'normal'
}

const applyZoom = (zoom: ZoomLevel) => {
  document.documentElement.style.fontSize = `${16 * ZOOM_SCALE[zoom]}px`
}

applyZoom(getInitialZoom())

export const useAccessibilityStore = create<AccessibilityStore>((set) => ({
  zoom: getInitialZoom(),
  cycleZoom: () => {
    set((state) => {
      const idx = ZOOM_ORDER.indexOf(state.zoom)
      const next = ZOOM_ORDER[(idx + 1) % ZOOM_ORDER.length]
      localStorage.setItem('a11y-zoom', next)
      applyZoom(next)
      return { zoom: next }
    })
  },
}))

export { ZOOM_LABEL }
