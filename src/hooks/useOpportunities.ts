import { useState, useEffect, useCallback } from "react"
import { getOpportunities, type OpportunityFilters } from "@/services/opportunities"
import type { Opportunity } from "@/types/database"

export function useOpportunities(initialFilters: OpportunityFilters = {}) {
  const [data, setData] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<OpportunityFilters>(initialFilters)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data: opps, error: err } = await getOpportunities(filters)
    if (err) setError(err.message)
    else setData(opps)
    setLoading(false)
  }, [filters])

  useEffect(() => { fetch() }, [fetch])

  return { data, loading, error, filters, setFilters, refetch: fetch }
}
