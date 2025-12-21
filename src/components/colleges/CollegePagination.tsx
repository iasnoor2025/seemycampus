"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { Suspense } from "react"

interface CollegePaginationProps {
  currentPage: number
  totalPages: number
}

function CollegePaginationInner({ currentPage, totalPages }: CollegePaginationProps) {
  const router = useRouter()

  const handlePageChange = (page: number) => {
    router.push(`?page=${page}`)
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (currentPage > 3) {
        pages.push("...")
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push("...")
      }

      // Always show last page
      pages.push(totalPages)
    }

    return pages
  }

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {/* Previous Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="border-gray-300 text-gray-700 hover:bg-gray-50"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Previous
      </Button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, index) => {
          if (page === "...") {
            return (
              <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
                ...
              </span>
            )
          }

          const pageNum = page as number
          const isActive = pageNum === currentPage

          return (
            <Button
              key={pageNum}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(pageNum)}
              className={
                isActive
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }
            >
              {pageNum}
            </Button>
          )
        })}
      </div>

      {/* Next Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="border-gray-300 text-gray-700 hover:bg-gray-50"
      >
        Next
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  )
}

export function CollegePagination(props: CollegePaginationProps) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center gap-2 mt-8">
      <div className="h-9 w-20 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-9 w-9 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-9 w-9 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-9 w-20 bg-gray-200 rounded animate-pulse"></div>
    </div>}>
      <CollegePaginationInner {...props} />
    </Suspense>
  )
}

