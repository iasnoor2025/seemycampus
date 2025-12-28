"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TimeSeriesData {
  date: string
  value: number
  label?: string
}

interface TimeSeriesChartProps {
  title: string
  data: TimeSeriesData[]
  color?: string
}

export function TimeSeriesChart({ title, data, color = "bg-blue-600" }: TimeSeriesChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No data available for this period
          </p>
        </CardContent>
      </Card>
    )
  }

  const maxValue = Math.max(...data.map(d => d.value), 1)
  const minValue = Math.min(...data.map(d => d.value), 0)
  const range = maxValue - minValue || 1

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* Chart Area */}
          <div className="relative h-48 flex items-end justify-between gap-1">
            {data.map((item, index) => {
              const height = ((item.value - minValue) / range) * 100
              return (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center group relative"
                  style={{ minWidth: "20px" }}
                >
                  <div
                    className={`w-full ${color} rounded-t transition-all hover:opacity-80 cursor-pointer`}
                    style={{ height: `${height}%`, minHeight: item.value > 0 ? "4px" : "0" }}
                    title={`${item.label || item.date}: ${item.value}`}
                  />
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                    {item.label || item.date}: {item.value}
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* X-axis labels */}
          <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
            {data.map((item, index) => (
              <span key={index} className="text-center" style={{ flex: 1 }}>
                {item.date.length > 10 ? item.date.substring(5, 10) : item.date}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

