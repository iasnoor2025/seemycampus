"use client"

import { useState, useEffect, useRef } from "react"
import { Instagram, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"

interface InstagramPost {
  id: string
  media_url: string
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM"
  permalink: string
  caption?: string
  timestamp: string
  thumbnail_url?: string
}

export function InstagramFeed() {
  const [posts, setPosts] = useState<InstagramPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [currentSlide, setCurrentSlide] = useState(0)
  const [itemsPerView, setItemsPerView] = useState(1)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    fetchInstagramPosts()
  }, [])

  const fetchInstagramPosts = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/instagram/feed")
      if (!response.ok) throw new Error("Failed to fetch Instagram posts")
      const data = await response.json()
      if (data.posts && Array.isArray(data.posts)) {
        setPosts(data.posts.slice(0, 12)) // Take 12 for better slider
      } else {
        setPosts([])
      }
    } catch (err: any) {
      console.error("Error fetching Instagram feed:", err)
      setError(err.message || "Unable to load Instagram feed")
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setItemsPerView(3)
      else if (window.innerWidth >= 640) setItemsPerView(2)
      else setItemsPerView(1)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const maxSlides = posts.length > 0 ? Math.ceil(posts.length / itemsPerView) : 0

  useEffect(() => {
    if (scrollContainerRef.current && maxSlides > 0 && !isReady) {
      const { clientWidth } = scrollContainerRef.current
      scrollContainerRef.current.scrollLeft = maxSlides * clientWidth
      setIsReady(true)
    }
  }, [maxSlides, isReady])

  const handleScroll = () => {
    if (!scrollContainerRef.current || !isReady || maxSlides === 0) return
    const { scrollLeft, clientWidth } = scrollContainerRef.current
    if (clientWidth === 0) return

    const absoluteSlideIndex = Math.round(scrollLeft / clientWidth)
    const logicalSlideIndex = absoluteSlideIndex % maxSlides

    if (logicalSlideIndex !== currentSlide) {
      setCurrentSlide(logicalSlideIndex)
    }

    // Infinite loop jump
    if (scrollLeft <= clientWidth * 0.5) {
      scrollContainerRef.current.scrollLeft = scrollLeft + (maxSlides * clientWidth)
    } else if (scrollLeft >= clientWidth * (maxSlides * 2 + maxSlides - 0.5)) {
      scrollContainerRef.current.scrollLeft = scrollLeft - (maxSlides * clientWidth)
    }
  }

  const goToSlide = (index: number) => {
    if (!scrollContainerRef.current || maxSlides === 0) return
    scrollContainerRef.current.scrollTo({
      left: (index + maxSlides) * scrollContainerRef.current.clientWidth,
      behavior: "smooth"
    })
  }

  const goToPrevious = () => {
    const prevSlide = (currentSlide - 1 + maxSlides) % maxSlides
    goToSlide(prevSlide)
  }

  const goToNext = () => {
    const nextSlide = (currentSlide + 1) % maxSlides
    goToSlide(nextSlide)
  }

  if (loading) {
    return (
      <div className="relative w-full h-[600px] rounded-[2.5rem] overflow-hidden bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 mx-auto mb-4 text-white animate-spin" />
          <p className="text-sm text-white font-bold">Connecting to Instagram...</p>
        </div>
      </div>
    )
  }

  if (error || posts.length === 0) {
    return (
      <div className="relative w-full h-[600px] rounded-[2.5rem] overflow-hidden group">
        <Image
          src="/guidance-placeholder.png"
          alt="Student guidance"
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        <div className="absolute bottom-6 left-6 flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 shadow-2xl">
          <Instagram className="h-6 w-6 text-[#E4405F]" />
          <span className="text-sm font-black text-white">@seemycampus</span>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full group/main">
      <div className="relative h-[600px] rounded-[2.5rem] overflow-hidden bg-white shadow-2xl">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="h-full overflow-x-auto flex snap-x snap-mandatory scrollbar-hide"
        >
          {[0, 1, 2].map((blockIndex) => (
            Array.from({ length: maxSlides }).map((_, slideIndex) => (
              <div key={`${blockIndex}-${slideIndex}`} className="min-w-full h-full snap-start snap-always grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
                {posts
                  .slice(slideIndex * itemsPerView, (slideIndex + 1) * itemsPerView)
                  .map((post) => (
                    <a
                      key={`${blockIndex}-${post.id}`}
                      href={post.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative group overflow-hidden bg-slate-100 h-full border-r border-white/10"
                    >
                      <Image
                        src={post.media_type === "VIDEO" && post.thumbnail_url ? post.thumbnail_url : post.media_url}
                        alt={post.caption || "Instagram post"}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-500 flex items-center justify-center">
                        <Instagram className="h-10 w-10 text-white opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-500" />
                      </div>
                      {post.media_type === "VIDEO" && (
                        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full p-2">
                          <svg className="h-4 w-4 text-white fill-current" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                        </div>
                      )}
                    </a>
                  ))}
              </div>
            ))
          ))}
        </div>

        {/* Brand Overlay */}
        <div className="absolute bottom-6 left-6 z-20 flex items-center gap-3 bg-white/90 backdrop-blur-sm px-5 py-3 rounded-2xl shadow-2xl border border-white transform group-hover/main:scale-105 transition-transform duration-500">
          <div className="bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] p-1.5 rounded-xl shadow-inner">
            <Instagram className="h-6 w-6 text-white" />
          </div>
          <span className="text-sm font-black text-slate-800 tracking-tight">@seemycampus</span>
        </div>

        {/* Navigation Controls */}
        <button
          onClick={goToPrevious}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-30 bg-white/90 backdrop-blur-sm hover:bg-white p-4 rounded-full shadow-2xl text-slate-900 opacity-0 group-hover/main:opacity-100 transition-all duration-500 -translate-x-4 group-hover/main:translate-x-0"
          aria-label="Previous"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-30 bg-white/90 backdrop-blur-sm hover:bg-white p-4 rounded-full shadow-2xl text-slate-900 opacity-0 group-hover/main:opacity-100 transition-all duration-500 translate-x-4 group-hover/main:translate-x-0"
          aria-label="Next"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-8">
        {Array.from({ length: maxSlides }).map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`rounded-full transition-all duration-300 ${index === currentSlide ? "w-8 h-1.5 bg-slate-800" : "w-1.5 h-1.5 bg-slate-300 hover:bg-slate-400"}`}
          />
        ))}
      </div>
    </div>
  )
}
