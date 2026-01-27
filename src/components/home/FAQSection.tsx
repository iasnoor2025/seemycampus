"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight, HelpCircle } from "lucide-react"

interface FAQ {
  question: string
  answer: string
}

interface FAQSectionProps {
  faqs: FAQ[]
}

export function FAQSection({ faqs }: FAQSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [itemsPerView, setItemsPerView] = useState(1)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isReady, setIsReady] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

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

  if (!faqs || faqs.length === 0) return null

  const maxSlides = Math.ceil(faqs.length / itemsPerView)

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

  const goToPrevious = () => {
    const prevSlide = (currentSlide - 1 + maxSlides) % maxSlides
    goToSlide(prevSlide)
  }

  const goToNext = () => {
    const nextSlide = (currentSlide + 1) % maxSlides
    goToSlide(nextSlide)
  }

  useEffect(() => {
    if (faqs.length <= itemsPerView || isPaused || !isReady || maxSlides === 0) return
    const interval = setInterval(() => goToNext(), 6000)
    return () => clearInterval(interval)
  }, [faqs.length, isPaused, isReady, currentSlide, itemsPerView, maxSlides])

  const gradients = [
    "from-blue-600 to-indigo-700",
    "from-purple-600 to-blue-600",
    "from-indigo-600 to-purple-700",
    "from-blue-600 to-violet-700",
    "from-violet-500 to-fuchsia-600",
    "from-purple-500 to-pink-600"
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-white via-slate-50 to-blue-50/30 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-200 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-full mb-4 shadow-lg">
            <HelpCircle className="w-5 h-5" />
            <span className="font-bold text-[10px] uppercase tracking-wider">Got Questions?</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-4 leading-tight tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-600 text-sm md:text-base font-medium max-w-2xl mx-auto">
            About College Admissions and Courses
          </p>
        </div>

        <div
          className="relative max-w-7xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {maxSlides > 1 ? (
            <div className="group/carousel">
              <div className="absolute top-1/2 -left-4 -right-4 -translate-y-1/2 flex justify-between z-20 pointer-events-none opacity-0 group-hover/carousel:opacity-100 transition-all duration-500">
                <button onClick={goToPrevious} className="w-12 h-12 rounded-2xl bg-white/90 backdrop-blur-md shadow-xl flex items-center justify-center text-slate-800 hover:bg-blue-600 hover:text-white transition-all pointer-events-auto border border-white/50"><ChevronLeft className="w-6 h-6" /></button>
                <button onClick={goToNext} className="w-12 h-12 rounded-2xl bg-white/90 backdrop-blur-md shadow-xl flex items-center justify-center text-slate-800 hover:bg-blue-600 hover:text-white transition-all pointer-events-auto border border-white/50"><ChevronRight className="w-6 h-6" /></button>
              </div>

              <div ref={scrollContainerRef} onScroll={handleScroll} className="overflow-x-auto flex snap-x snap-mandatory scrollbar-hide py-8">
                {[0, 1, 2].map((blockIndex) => (
                  Array.from({ length: maxSlides }).map((_, slideIndex) => (
                    <div key={`${blockIndex}-${slideIndex}`} className="min-w-full snap-start snap-always flex gap-6 px-4">
                      {faqs.slice(slideIndex * itemsPerView, (slideIndex + 1) * itemsPerView).map((faq, index) => (
                        <div key={`${blockIndex}-${slideIndex * itemsPerView + index}`} className="flex-1">
                          <FAQCard faq={faq} index={slideIndex * itemsPerView + index} gradients={gradients} totalFaqs={faqs.length} />
                        </div>
                      ))}
                      {slideIndex === maxSlides - 1 && faqs.slice(slideIndex * itemsPerView, (slideIndex + 1) * itemsPerView).length < itemsPerView &&
                        Array.from({ length: itemsPerView - faqs.slice(slideIndex * itemsPerView, (slideIndex + 1) * itemsPerView).length }).map((_, i) => (
                          <div key={`empty-${blockIndex}-${i}`} className="flex-1" />
                        ))}
                    </div>
                  ))
                ))}
              </div>

              <div className="flex justify-center gap-2 mt-4">
                {Array.from({ length: maxSlides }).map((_, idx) => (
                  <button key={idx} onClick={() => goToSlide(idx)} className={`rounded-full transition-all duration-500 ${idx === currentSlide ? "w-8 h-1.5 bg-blue-600" : "w-1.5 h-1.5 bg-blue-200 hover:bg-blue-300"}`} />
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-8">
              {faqs.map((faq, idx) => (
                <FAQCard key={idx} faq={faq} index={idx} gradients={gradients} totalFaqs={faqs.length} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function FAQCard({ faq, index, gradients, totalFaqs }: { faq: FAQ, index: number, gradients: string[], totalFaqs: number }) {
  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_25px_60px_rgba(37,99,235,0.08)] transition-all duration-700 transform hover:-translate-y-3 border border-slate-100/50 group relative overflow-hidden flex flex-col min-h-[250px] h-full">
      <div className={`absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br ${gradients[index % gradients.length]} opacity-0 group-hover:opacity-10 rounded-full transition-all duration-700 blur-3xl`}></div>
      <div className="flex items-start gap-5 mb-6 relative z-10">
        <div className={`shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br ${gradients[index % gradients.length]} text-white flex items-center justify-center font-black text-lg shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
          {(index % totalFaqs) + 1}
        </div>
        <h3 className="text-xl font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors duration-300 tracking-tight">{faq.question}</h3>
      </div>
      <p className="text-slate-600 leading-relaxed font-bold text-sm relative z-10">{faq.answer}</p>
    </div>
  )
}
