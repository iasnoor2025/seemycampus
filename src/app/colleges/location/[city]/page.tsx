import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Building, MapPin, TrendingUp, Award, Users } from "lucide-react"
import { CollegeLogo } from "@/components/college/CollegeLogo"
import { getCollegesByCity, getCityStats, getAllCities } from "@/lib/colleges"
import { PaginationWrapper } from "@/components/colleges/PaginationWrapper"
import { generateBreadcrumbList, baseUrl } from "@/lib/seo/generateMeta"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface PageProps {
  params: Promise<{ city: string }>
  searchParams: Promise<{ page?: string }>
}

// Top 50 Indian cities for location pages
export const topIndianCities = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad",
  "Jaipur", "Surat", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal",
  "Visakhapatnam", "Patna", "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Nashik",
  "Faridabad", "Meerut", "Rajkot", "Varanasi", "Srinagar", "Amritsar", "Dhanbad",
  "Jabalpur", "Raipur", "Allahabad", "Coimbatore", "Jodhpur", "Madurai", "Gwalior",
  "Vijayawada", "Chandigarh", "Kota", "Guwahati", "Solapur", "Hubli", "Bareilly",
  "Moradabad", "Mysore", "Gurgaon", "Aligarh", "Jalandhar", "Bhubaneswar"
]

export async function generateStaticParams() {
  // Generate static params for top cities
  return topIndianCities.map((city) => ({
    city: city.toLowerCase().replace(/\s+/g, "-"),
  }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city } = await params
  const cityName = city.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
  
  return {
    title: `Best Colleges in ${cityName} | Top Universities & Institutes | SeeMyCampus`,
    description: `Find the best colleges and universities in ${cityName}. Explore top-ranked institutions, courses, admission details, fees, placements, and rankings. Complete guide to ${cityName} colleges for 2025.`,
    keywords: [
      `colleges in ${cityName}`,
      `best colleges in ${cityName}`,
      `universities in ${cityName}`,
      `${cityName} colleges`,
      `top colleges ${cityName}`,
      `college admission ${cityName}`,
      `colleges near ${cityName}`,
      "college finder",
      "college search",
      "education",
    ],
    openGraph: {
      title: `Best Colleges in ${cityName} | SeeMyCampus`,
      description: `Find the best colleges and universities in ${cityName}. Explore top-ranked institutions, courses, admission details, fees, and placements.`,
      url: `${baseUrl}/colleges/location/${city}`,
      type: "website",
      locale: "en_IN",
      siteName: "SeeMyCampus",
    },
    twitter: {
      card: "summary_large_image",
      title: `Best Colleges in ${cityName} | SeeMyCampus`,
      description: `Find the best colleges and universities in ${cityName}. Explore top-ranked institutions, courses, admission details, fees, and placements.`,
    },
    alternates: {
      canonical: `${baseUrl}/colleges/location/${city}`,
    },
  }
}

export default async function LocationPage({ params, searchParams }: PageProps) {
  const { city } = await params
  const params_searchParams = await searchParams
  const currentPage = parseInt(params_searchParams.page || "1", 10)
  
  const cityName = city.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
  
  // Get colleges and stats for this city
  const { colleges: collegesList, pagination } = await getCollegesByCity(cityName, currentPage, 20)
  const cityStats = await getCityStats(cityName)
  
  if (collegesList.length === 0) {
    notFound()
  }
  
  // Generate breadcrumb structured data
  const breadcrumbData = generateBreadcrumbList([
    { name: "Home", url: "/" },
    { name: "Colleges", url: "/colleges" },
    { name: `Colleges in ${cityName}`, url: `/colleges/location/${city}` },
  ])
  
  // Generate LocalBusiness structured data for location
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: `Colleges in ${cityName}`,
    description: `Complete guide to colleges and universities in ${cityName}. Find top-ranked institutions, courses, admission details, and more.`,
    address: {
      "@type": "PostalAddress",
      addressLocality: cityName,
      addressCountry: "IN",
    },
    aggregateRating: cityStats.averageRanking ? {
      "@type": "AggregateRating",
      ratingValue: "4.5",
      reviewCount: cityStats.totalColleges.toString(),
    } : undefined,
  }
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-900 text-white py-12 md:py-16 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400 rounded-full blur-3xl"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-5xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full mb-4 shadow-lg">
                <MapPin className="w-5 h-5" />
                <span className="font-medium text-sm">Location: {cityName}</span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-blue-100 to-indigo-100 bg-clip-text text-transparent">
                Best Colleges in {cityName}
              </h1>
              <p className="text-xl text-white/90 mb-6">
                Discover top-ranked colleges and universities in {cityName}. Find complete information about admission, courses, fees, placements, and rankings.
              </p>
              
              {/* City Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Building className="w-5 h-5" />
                    <span className="text-sm font-medium">Total Colleges</span>
                  </div>
                  <p className="text-2xl font-bold">{cityStats.totalColleges}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-5 h-5" />
                    <span className="text-sm font-medium">Private</span>
                  </div>
                  <p className="text-2xl font-bold">{cityStats.privateColleges}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5" />
                    <span className="text-sm font-medium">Government</span>
                  </div>
                  <p className="text-2xl font-bold">{cityStats.governmentColleges}</p>
                </div>
                {cityStats.averageRanking && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5" />
                      <span className="text-sm font-medium">Avg Ranking</span>
                    </div>
                    <p className="text-2xl font-bold">{cityStats.averageRanking}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Top Colleges Section */}
          {cityStats.topColleges.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Top Ranked Colleges in {cityName}</CardTitle>
                <CardDescription>Highest ranked institutions in {cityName}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cityStats.topColleges.map((college) => (
                    <Link
                      key={college.slug}
                      href={`/colleges/${college.slug}`}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Award className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{college.name}</p>
                        <p className="text-xs text-muted-foreground">Rank #{college.ranking}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Colleges Listing */}
          <div className="mb-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-4 border border-slate-200">
            <div className="grid grid-cols-12 gap-4 py-2 font-semibold text-gray-900">
              <div className="col-span-2 text-center">PREVIEW</div>
              <div className="col-span-5">COLLEGE NAME</div>
              <div className="col-span-3">LOCATION</div>
              <div className="col-span-2 text-center">VIEW</div>
            </div>
          </div>

          <div className="space-y-4">
            {collegesList.map((college) => (
              <div
                key={college.id}
                className="grid grid-cols-12 gap-4 items-center bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200 p-4 md:p-6"
              >
                {/* Preview - Logo */}
                <div className="col-span-2 flex justify-center">
                  <CollegeLogo
                    collegeId={college.id}
                    collegeName={college.name}
                    imageUrl={college.images && Array.isArray(college.images) && college.images.length > 0 ? college.images[0] : null}
                    size="lg"
                    variant="circle"
                  />
                </div>

                {/* College Name */}
                <div className="col-span-5">
                  <Link href={`/colleges/${college.slug}`}>
                    <h3 className="text-base font-bold text-gray-900 hover:text-blue-600 transition-colors">
                      {college.name}
                    </h3>
                  </Link>
                  {college.ranking && (
                    <p className="text-xs text-muted-foreground mt-1">Ranked #{college.ranking}</p>
                  )}
                </div>

                {/* Location */}
                <div className="col-span-3">
                  <p className="text-sm text-gray-700">
                    {college.location || college.city || "Location not specified"}
                  </p>
                </div>

                {/* View Button */}
                <div className="col-span-2 flex justify-center">
                  <Link href={`/colleges/${college.slug}`}>
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg transition-all">
                      VIEW MORE
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8">
              <PaginationWrapper
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
              />
            </div>
          )}

          {/* SEO Content Section */}
          <div className="mt-12 prose prose-slate max-w-none">
            <h2>About Colleges in {cityName}</h2>
            <p>
              {cityName} is home to {cityStats.totalColleges} colleges and universities, offering a wide range of courses and programs. 
              {cityStats.privateColleges > 0 && ` The city has ${cityStats.privateColleges} private institutions`}
              {cityStats.governmentColleges > 0 && ` and ${cityStats.governmentColleges} government colleges`}
              , providing students with diverse educational opportunities.
            </p>
            <p>
              Whether you're looking for engineering colleges, medical institutions, business schools, or arts colleges, 
              {cityName} has options to suit every academic interest. Our comprehensive database includes detailed information 
              about admission processes, fees, placements, rankings, and more for each institution.
            </p>
            <h3>Why Choose Colleges in {cityName}?</h3>
            <ul>
              <li>Wide range of courses and specializations</li>
              <li>Top-ranked institutions with excellent placement records</li>
              <li>Affordable fee structures</li>
              <li>Strong industry connections and internship opportunities</li>
              <li>Vibrant student community and campus life</li>
            </ul>
            <h3>How to Apply to Colleges in {cityName}</h3>
            <p>
              The admission process varies by college and course. Most colleges in {cityName} accept scores from national 
              entrance exams like JEE, NEET, CAT, and state-level exams. Some institutions also conduct their own entrance 
              tests. Visit individual college pages for detailed admission requirements, application deadlines, and cutoff scores.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

