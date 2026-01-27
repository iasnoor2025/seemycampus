interface FAQ {
  question: string
  answer: string
}

interface FAQSectionProps {
  faqs: FAQ[]
}

export function FAQSection({ faqs }: FAQSectionProps) {
  // Don't render if no FAQs
  if (!faqs || faqs.length === 0) {
    return null
  }

  const gradients = [
    "from-blue-500 to-cyan-600",
    "from-indigo-500 to-purple-600",
    "from-violet-500 to-purple-600",
    "from-teal-500 to-emerald-600",
    "from-sky-500 to-blue-600",
    "from-purple-500 to-pink-600"
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-white via-slate-50 to-blue-50/30 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-200 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-full mb-4 shadow-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium text-sm">Got Questions?</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-4 leading-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto">
            About College Admissions and Courses
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* FAQ Items */}
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white/80 backdrop-blur-sm rounded-[2rem] p-10 shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(37,99,235,0.1)] transition-all duration-500 transform hover:-translate-y-3 border border-slate-100 group relative overflow-hidden"
            >
              {/* Decorative background element */}
              <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${gradients[index % gradients.length]} opacity-0 group-hover:opacity-5 rounded-full transition-opacity duration-500 blur-2xl`}></div>

              {/* Question */}
              <div className="flex items-start gap-4 mb-6">
                <div className={`shrink-0 w-10 h-10 rounded-2xl bg-gradient-to-br ${gradients[index % gradients.length]} text-white flex items-center justify-center font-black text-sm shadow-lg transform group-hover:rotate-12 transition-all duration-500`}>
                  {index + 1}
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors duration-300">
                  {faq.question}
                </h3>
              </div>

              {/* Answer */}
              <p className="text-slate-600 leading-relaxed font-medium">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
