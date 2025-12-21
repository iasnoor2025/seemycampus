"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { CollegePagination } from "./CollegePagination"

interface PaginationWrapperProps {
  currentPage: number
  totalPages: number
}

export function PaginationWrapper({ currentPage, totalPages }: PaginationWrapperProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (page === 1) {
      params.delete("page")
    } else {
      params.set("page", page.toString())
    }
    const queryString = params.toString()
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname
    router.push(newUrl)
  }

  return (
    <CollegePagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
    />
  )
}

