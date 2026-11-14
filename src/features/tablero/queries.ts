import { useQuery } from "@tanstack/react-query"
import { getResumenTablero } from "./api"

export const tableroKeys = {
  resumen: ["tablero", "resumen"] as const,
}

export function useResumenTableroQuery() {
  return useQuery({
    queryKey: tableroKeys.resumen,
    queryFn: getResumenTablero,
  })
}
