import { CreditCard, PiggyBank, Receipt, Wallet } from "lucide-react"
import { MetricCard } from "@/components/MetricCard"

const formatoPesos = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
})

export function MetricCardPage() {
    return (
        <div>
            <h1 className="text-2xl font-bold">Cards de métricas</h1>
            <p className="mt-2 text-muted-foreground">
                Tarjetas que resumen un indicador clave con su variación respecto del período anterior.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    label="Ingresos del mes"
                    value={formatoPesos.format(1250000)}
                    icon={Wallet}
                    change="+12,5%"
                    trend="up"
                    description="vs. mes anterior"
                />
                <MetricCard
                    label="Egresos del mes"
                    value={formatoPesos.format(830000)}
                    icon={CreditCard}
                    change="+4,2%"
                    trend="down"
                    description="vs. mes anterior"
                />
                <MetricCard
                    label="Saldo disponible"
                    value={formatoPesos.format(420000)}
                    icon={PiggyBank}
                    change="0%"
                    description="sin cambios"
                />
                <MetricCard
                    label="Facturas por vencer"
                    value="7"
                    icon={Receipt}
                    change="+3"
                    trend="down"
                    description="esta semana"
                />
            </div>
        </div>
    )
}
