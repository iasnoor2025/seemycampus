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
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    fetchInstagramPosts()
  }, [])

  const fetchInstagramPosts = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/instagram/feed")
      if (!response.ok) throw new Error("Failed to fetch")
      const data = await response.json()
      setPosts(data.posts?.slice(0, 12) || [])
    } catch (err: any) {
      console.error(err)
      setError("Failed to load")
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
    if (scrollContainerRef.current && maxSlides > 0 && !isReady && !loading) {
      const { clientWidth } = scrollContainerRef.current
      scrollContainerRef.current.scrollLeft = maxSlides * clientWidth
      setIsReady(true)
    }
  }, [maxSlides, isReady, loading])

  const handleScroll = () => {
    if (!scrollContainerRef.current || !isReady || maxSlides === 0) return
    const { scrollLeft, clientWidth } = scrollContainerRef.current
    if (clientWidth === 0) return

    const absoluteSlideIndex = Math.round(scrollLeft / clientWidth)
    const logicalSlideIndex = absoluteSlideIndex % maxSlides
    if (logicalSlideIndex !== currentSlide) setCurrentSlide(logicalSlideIndex)

    if (scrollLeft <= clientWidth * 0.5) {
      scrollContainerRef.current.scrollLeft = scrollLeft + (maxSlides * clientWidth)
    } else if (scrollLeft >= clientWidth * (maxSlides * 2 + maxSlides - 0.5)) {
      scrollContainerRef.current.scrollLeft = scrollLeft - (maxSlides * clientWidth)
    }
  }

  const goToSlide = (index: number) => {
    if (!scrollContainerRef.current) return
    scrollContainerRef.current.scrollTo({
      left: (index + maxSlides) * scrollContainerRef.current.clientWidth,
      behavior: "smooth"
    })
  }

  const goToPrevious = () => goToSlide((currentSlide - 1 + maxSlides) % maxSlides)
  const goToNext = () => goToSlide((currentSlide + 1) % maxSlides)

  useEffect(() => {
    if (loading || posts.length <= itemsPerView || isPaused || !isReady || maxSlides === 0) return
    const interval = setInterval(() => goToNext(), 6000)
    return () => clearInterval(interval)
  }, [loading, posts.length, isPaused, isReady, currentSlide, itemsPerView, maxSlides])

  if (loading) {
    return <div className="h-[400px] flex items-center justify-center bg-slate-50 rounded-[2rem]"><Loader2 className="animate-spin text-blue-500" /></div>
  }

  if (error || posts.length === 0) {
    return (
      <div className="relative w-full h-[400px] rounded-[2rem] overflow-hidden group shadow-lg border border-slate-100/50 bg-white">
        <Image
          src="/guidance-placeholder.png"
          alt="Student guidance"
          fill
          className="object-contain transition-transform duration-700 hover:scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
        <div className="absolute bottom-6 left-6 flex items-center gap-2.5 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-white">
          <Instagram className="h-5 w-5" />
          <span className="text-xs font-black">@seemycampus</span>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full group/main">
      <div
        className="relative h-[420px] rounded-[2rem] overflow-hidden bg-slate-50 border border-slate-100"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {maxSlides > 1 ? (
          <>
            <div ref={scrollContainerRef} onScroll={handleScroll} className="h-full overflow-x-auto flex snap-x snap-mandatory scrollbar-hide">
              {[0, 1, 2].map((blockIndex) => (
                Array.from({ length: maxSlides }).map((_, slideIndex) => (
                  <div key={`${blockIndex}-${slideIndex}`} className="min-w-full h-full snap-start snap-always grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0.5">
                    {posts.slice(slideIndex * itemsPerView, (slideIndex + 1) * itemsPerView).map((post) => (
                      <InstagramCard key={`${blockIndex}-${post.id}`} post={post} />
                    ))}
                    {slideIndex === maxSlides - 1 && posts.slice(slideIndex * itemsPerView, (slideIndex + 1) * itemsPerView).length < itemsPerView &&
                      Array.from({ length: itemsPerView - posts.slice(slideIndex * itemsPerView, (slideIndex + 1) * itemsPerView).length }).map((_, i) => (
                        <div key={`empty-${blockIndex}-${i}`} className="bg-white/50" />
                      ))}
                  </div>
                ))
              ))}
            </div>
            <div className="absolute top-1/2 -left-2 -right-2 -translate-y-1/2 flex justify-between z-20 pointer-events-none opacity-0 group-hover/main:opacity-100 transition-all">
              <button onClick={goToPrevious} className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur-md shadow-lg flex items-center justify-center text-slate-800 hover:bg-blue-600 hover:text-white transition-all pointer-events-auto border border-white/50"><ChevronLeft className="w-5 h-5" /></button>
              <button onClick={goToNext} className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur-md shadow-lg flex items-center justify-center text-slate-800 hover:bg-blue-600 hover:text-white transition-all pointer-events-auto border border-white/50"><ChevronRight className="w-5 h-5" /></button>
            </div>
          </>
        ) : (
          <div className="h-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0.5">
            {posts.map((post) => <InstagramCard key={post.id} post={post} />)}
          </div>
        )}

        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3.5 py-2 rounded-xl shadow-md border border-white/50">
          <Instagram className="h-4 w-4 text-[#E4405F]" />
          <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider">@seemycampus</span>
        </div>
      </div>

      {maxSlides > 1 && (
        <div className="flex justify-center gap-1.5 mt-4">
          {Array.from({ length: maxSlides }).map((_, idx) => (
            <button key={idx} onClick={() => goToSlide(idx)} className={`rounded-full transition-all duration-300 ${idx === currentSlide ? "w-6 h-1 bg-blue-600" : "w-1 h-1 bg-blue-200"}`} />
          ))}
        </div>
      )}
    </div>
  )
}

function InstagramCard({ post }: { post: InstagramPost }) {
  return (
    <a href={post.permalink} target="_blank" rel="noopener noreferrer" className="relative group overflow-hidden bg-slate-100 h-full block">
      <Image
        src={post.media_type === "VIDEO" && post.thumbnail_url ? post.thumbnail_url : post.media_url}
        alt={post.caption || "Instagram post"}
        fill
        className="object-cover group-hover:scale-110 transition-transform duration-700"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
        <Instagram className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300" />
      </div>
    </a>
  )
}
