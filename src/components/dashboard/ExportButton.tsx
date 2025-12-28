"use client"

import { Button } from "@/components/ui/button"
import { Download, FileSpreadsheet } from "lucide-react"

interface ExportButtonProps {
  data: any[]
  filename: string
  label?: string
}

export function ExportButton({ data, filename, label = "Export" }: ExportButtonProps) {
  const handleExport = () => {
    if (data.length === 0) {
      alert("No data to export")
      return
    }

    // Convert data to CSV
    const headers = Object.keys(data[0])
    const csvRows = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header]
            // Handle null/undefined and escape commas/quotes
            if (value === null || value === undefined) return ""
            const stringValue = String(value)
            if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
              return `"${stringValue.replace(/"/g, '""')}"`
            }
            return stringValue
          })
          .join(",")
      ),
    ]

    const csvContent = csvRows.join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    link.setAttribute("href", url)
    link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      className="gap-2"
      disabled={data.length === 0}
    >
      <Download className="h-4 w-4" />
      {label}
    </Button>
  )
}

