
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react"

interface AnalyticsChartProps {
  title: string
  data: Array<{ label: string; value: number; color?: string }>
  total?: number
}

export function SimpleBarChart({ title, data, total }: AnalyticsChartProps) {
  const maxValue = Math.max(...data.map(d => d.value), 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {total !== undefined && (
          <p className="text-sm text-muted-foreground mt-1">Total: {total}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{item.label}</span>
                <span className="text-sm text-muted-foreground">{item.value}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all ${item.color || "bg-blue-600"
                    }`}
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

interface ConversionFunnelProps {
  stages: Array<{ label: string; count: number; percentage: number }>
}

export function ConversionFunnel({ stages }: ConversionFunnelProps) {
  const totalLeads = stages[0]?.count || 0
  const hasNoData = totalLeads === 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Conversion Funnel</CardTitle>
      </CardHeader>
      <CardContent>
        {hasNoData ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              No leads yet. The conversion funnel will appear here once you have leads.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {stages.map((stage, index) => (
              <div key={index} className="relative">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{stage.label}</span>
                  <span className="text-sm text-muted-foreground">
                    {stage.count} ({stage.percentage > 0 ? stage.percentage.toFixed(1) : "0.0"}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${Math.max(stage.percentage, 0)}%` }}
                  />
                </div>
                {index < stages.length - 1 && (
                  <div className="flex justify-center my-1">
                    <ArrowDownRight className="h-4 w-4 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon?: React.ReactNode
  trend?: "up" | "down"
}

export function MetricCard({ title, value, change, changeLabel, icon, trend }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs mt-1 ${trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-muted-foreground"
            }`}>
            {trend === "up" ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : trend === "down" ? (
              <ArrowDownRight className="h-3 w-3" />
            ) : null}
            <span>
              {change > 0 ? "+" : ""}{change}% {changeLabel || "vs last period"}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

