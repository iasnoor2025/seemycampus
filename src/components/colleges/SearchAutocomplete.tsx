"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Search, GraduationCap, MapPin, BookOpen, Award } from "lucide-react"
import { useDebounce } from "@/lib/hooks/useDebounce"

interface AutocompleteSuggestion {
  id: string
  text: string
  type: "college" | "course" | "location" | "exam"
  slug?: string
  metadata?: Record<string, any>
}

interface SearchAutocompleteProps {
  placeholder?: string
  onSearch?: (query: string) => void
  className?: string
  size?: "default" | "lg"
}

const typeIcons = {
  college: GraduationCap,
  course: BookOpen,
  location: MapPin,
  exam: Award,
}

export function SearchAutocomplete({
  placeholder = "Search for colleges, exams, courses and more..",
  onSearch,
  className = "",
  size = "default",
}: SearchAutocompleteProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const debouncedQuery = useDebounce(query, 300)

  // Fetch suggestions when query changes
  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      fetchSuggestions(debouncedQuery)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [debouncedQuery])

  const fetchSuggestions = async (searchQuery: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/search/autocomplete?q=${encodeURIComponent(searchQuery)}&limit=20`)
      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.suggestions || [])
        setShowSuggestions(true)
        setSelectedIndex(-1)
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error)
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setShowSuggestions(true)
  }

  const handleSelect = (suggestion: AutocompleteSuggestion) => {
    // Always set the query to the display text (name), never the ID
    const displayText = suggestion.text || suggestion.id.replace(/^(college|course|location|exam)-/, "")
    setQuery(displayText)
    setShowSuggestions(false)

    // Navigate based on type
    if (suggestion.type === "college" && suggestion.slug) {
      router.push(`/colleges/${suggestion.slug}`)
    } else if (suggestion.type === "course" && suggestion.slug) {
      router.push(`/courses/${suggestion.slug}`)
    } else {
      // For location or general search, navigate to colleges page with search query
      router.push(`/colleges?search=${encodeURIComponent(displayText)}`)
    }

    if (onSearch) {
      onSearch(displayText)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSelect(suggestions[selectedIndex])
      } else {
        router.push(`/colleges?search=${encodeURIComponent(query.trim())}`)
        if (onSearch) {
          onSearch(query.trim())
        }
      }
      setShowSuggestions(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case "Enter":
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          e.preventDefault()
          handleSelect(suggestions[selectedIndex])
        }
        break
      case "Escape":
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const inputSizeClasses = size === "lg" ? "py-3 sm:py-4 md:py-5 lg:py-6 text-sm sm:text-base" : "py-2 text-sm"
  const iconSizeClasses = size === "lg" ? "h-4 w-4 sm:h-5 sm:w-5" : "h-4 w-4"

  return (
    <div className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className={`absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 ${iconSizeClasses} text-gray-400`} />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true)
            }
          }}
          className={`pl-9 sm:pl-12 pr-3 sm:pr-4 ${inputSizeClasses} bg-white border-0 rounded-lg shadow-lg focus:ring-2 focus:ring-orange-500`}
        />
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (suggestions.length > 0 || loading) && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto"
        >
          {loading && (
            <div className="p-4 text-center text-gray-500 text-sm">Loading suggestions...</div>
          )}
          {!loading && suggestions.length === 0 && query.trim().length >= 2 && (
            <div className="p-4 text-center text-gray-500 text-sm">No suggestions found</div>
          )}
          {!loading &&
            suggestions.map((suggestion, index) => {
              const Icon = typeIcons[suggestion.type] || Search
              const isSelected = index === selectedIndex

              return (
                <button
                  key={suggestion.id}
                  type="button"
                  onClick={() => handleSelect(suggestion)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                    isSelected ? "bg-gray-50" : ""
                  }`}
                >
                  <Icon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{suggestion.text}</div>
                    {suggestion.metadata?.location && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        {suggestion.metadata.location}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 capitalize flex-shrink-0">
                    {suggestion.type}
                  </span>
                </button>
              )
            })}
        </div>
      )}
    </div>
  )
}

