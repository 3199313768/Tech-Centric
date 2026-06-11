'use client'

import { useEffect } from 'react'

export function useSyncInitialData<T>(initial: T, setState: (value: T) => void) {
  useEffect(() => {
    setState(initial)
  }, [initial, setState])
}
