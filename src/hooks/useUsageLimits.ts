import { useState, useCallback, useEffect } from 'react'
import { useTier } from '../contexts/TierContext'

const STORAGE_KEY = 'nullupload_usage'
const FREE_DAILY_LIMIT = 5
const FREE_BATCH_LIMIT = 3

interface UsageData {
  [toolId: string]: {
    count: number
    date: string // YYYY-MM-DD
  }
}

function getTodayKey(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function loadUsage(): UsageData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function saveUsage(data: UsageData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function getToolUsageToday(data: UsageData, toolId: string): number {
  const today = getTodayKey()
  const entry = data[toolId]
  if (!entry || entry.date !== today) return 0
  return entry.count
}

export function useUsageLimits(toolId: string) {
  const { isPro } = useTier()
  const [usage, setUsage] = useState<UsageData>(loadUsage)

  // Sync from localStorage on mount and across tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setUsage(loadUsage())
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const usedToday = getToolUsageToday(usage, toolId)
  const remaining = isPro ? Infinity : Math.max(0, FREE_DAILY_LIMIT - usedToday)
  const limitReached = !isPro && remaining <= 0
  const dailyLimit = isPro ? Infinity : FREE_DAILY_LIMIT
  const batchLimit = isPro ? Infinity : FREE_BATCH_LIMIT

  const recordUsage = useCallback(
    (fileCount: number = 1) => {
      if (isPro) return true // Pro has no limits

      const today = getTodayKey()
      const currentData = loadUsage()
      const currentCount = getToolUsageToday(currentData, toolId)

      if (currentCount + fileCount > FREE_DAILY_LIMIT) {
        return false // Would exceed limit
      }

      const updated: UsageData = {
        ...currentData,
        [toolId]: {
          count: currentCount + fileCount,
          date: today,
        },
      }
      saveUsage(updated)
      setUsage(updated)
      return true
    },
    [isPro, toolId],
  )

  const canProcess = useCallback(
    (fileCount: number = 1): boolean => {
      if (isPro) return true
      return remaining >= fileCount
    },
    [isPro, remaining],
  )

  const clampBatch = useCallback(
    (fileCount: number): number => {
      if (isPro) return fileCount
      return Math.min(fileCount, batchLimit)
    },
    [isPro, batchLimit],
  )

  return {
    usedToday,
    remaining,
    limitReached,
    dailyLimit,
    batchLimit,
    recordUsage,
    canProcess,
    clampBatch,
    isPro,
  }
}
