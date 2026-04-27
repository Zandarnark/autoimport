import { create } from 'zustand'

export interface CompareItem {
  id: string
  brand: string
  model: string
  year: number
  bodyType: string
  engineType: string
  engineVolume: number
  mileage: number
  country: string
  price: number
}

interface CompareStore {
  items: CompareItem[]
  addItem: (item: CompareItem) => void
  removeItem: (id: string) => void
  clear: () => void
}

export const useCompareStore = create<CompareStore>((set) => ({
  items: [],
  addItem: (item) =>
    set((state) => {
      if (state.items.length >= 3 || state.items.find((i) => i.id === item.id)) return state
      return { items: [...state.items, item] }
    }),
  removeItem: (id) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
  clear: () => set({ items: [] }),
}))
