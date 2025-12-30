import { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CollegeLogo } from "@/components/college/CollegeLogo"
import { Building2, Handshake, GraduationCap, Users, Award, TrendingUp, Globe, Target, Sparkles, CheckCircle2 } from "lucide-react"
import { getCollegesPaginated } from "@/lib/colleges"
import { Button } from "@/components/ui/button"
import { PaginationWrapper } from "@/components/colleges/PaginationWrapper"

export const metadata: Metadata = {
  title: "Academic Alliance | SeeMyCampus",
  description: "Learn about our academic partnerships and alliances with leading educational institutions across India.",
  keywords: ["academic alliance", "partnerships", "colleges", "universities", "education partnerships"],
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 4)
}

interface AcademicAlliancePageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function AcademicAlliancePage({ searchParams }: AcademicAlliancePageProps) {
  const params = await searchParams
  const currentPage = parseInt(params.page || "1", 10)
  // Get only Academic Alliance partner colleges
  const { colleges, pagination } = await getCollegesPaginated(currentPage, 10, true)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-900 text-white overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full mb-6 shadow-lg">
              <Handshake className="w-5 h-5" />
              <span className="font-medium text-sm">Strategic Partnerships</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-indigo-100 bg-clip-text text-transparent">
              Academic Alliance
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Partnerships for Excellence in Education
            </p>
          </div>
        </div>
      </section>

      {/* Partner Colleges Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-full mb-4 shadow-lg">
              <Building2 className="w-5 h-5" />
              <span className="font-medium text-sm">Partner Colleges</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-4">
              Our Partner Colleges
            </h2>
            <p className="text-gray-600 text-lg">
              Explore our comprehensive directory of partner colleges and universities
            </p>
          </div>

          {/* Table Header */}
          <div className="mb-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-4 border border-slate-200">
            <div className="grid grid-cols-12 gap-4 py-2 font-semibold text-gray-900">
              <div className="col-span-2 text-center">PREVIEW</div>
              <div className="col-span-5">COLLEGE NAME</div>
              <div className="col-span-3">LOCATION</div>
              <div className="col-span-2 text-center">VIEW</div>
            </div>
          </div>

          {/* Colleges List */}
          {colleges.length === 0 ? (
            <div className="py-16 text-center bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200">
              <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">No partner colleges found</p>
              <p className="text-gray-500 text-sm">Check back soon for updates!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {colleges.map((college) => (
                <div
                  key={college.id}
                  className="grid grid-cols-12 gap-4 items-center bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200 p-4 md:p-6"
                >
                  {/* Preview - Logo */}
                  <div className="col-span-2 flex justify-center">
                    <CollegeLogo
                      collegeId={college.id}
                      collegeName={college.name}
                      imageUrl={college.images && college.images.length > 0 ? college.images[0] : null}
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
          )}

          {/* Pagination */}
          <div className="mt-8">
            <PaginationWrapper
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
            />
          </div>
        </div>
      </section>

      {/* Main Content Section - Three Information Cards */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-full mb-4 shadow-lg">
              <Sparkles className="w-5 h-5" />
              <span className="font-medium text-sm">Our Approach</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
              Why Partner With Us
            </h2>
          </div>

          {/* Three Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Partnership Card */}
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white">
              <CardHeader className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-t-lg">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Handshake className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-white text-xl font-bold text-center">Partnerships</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-700 leading-relaxed">
                  Seemycampus partners with leading educational institutions across India to provide students 
                  with access to the best educational opportunities. Our strategic alliances enable us to offer 
                  comprehensive information and seamless admission processes.
                </p>
              </CardContent>
            </Card>

            {/* Network Card */}
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white">
              <CardHeader className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-t-lg">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Globe className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-white text-xl font-bold text-center">Extensive Network</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-700 leading-relaxed">
                  Our academic alliances enable us to offer comprehensive information about over 60,000 institutions 
                  and 375,000+ courses, ensuring students have all the resources they need to make informed decisions 
                  about their educational journey.
                </p>
              </CardContent>
            </Card>

            {/* Excellence Card */}
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white">
              <CardHeader className="bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-t-lg">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center relative">
                  <Award className="h-8 w-8 text-white" />
                  <Target className="h-5 w-5 text-white absolute -top-1 -right-1" />
                </div>
                <CardTitle className="text-white text-xl font-bold text-center">Excellence</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-700 leading-relaxed">
                  We work with top-tier colleges and universities to ensure quality education delivery. Our partnerships 
                  focus on providing students with access to institutions that maintain high academic standards and 
                  excellent placement records.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="relative py-16 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Our Impact</h2>
            <p className="text-white/90">Numbers that speak for themselves</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">300+</div>
              <div className="text-sm md:text-base text-white/90">Partner Colleges</div>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">60K+</div>
              <div className="text-sm md:text-base text-white/90">Institutions Listed</div>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">375K+</div>
              <div className="text-sm md:text-base text-white/90">Courses Available</div>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">50K+</div>
              <div className="text-sm md:text-base text-white/90">Students Counseled</div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed About Academic Alliance Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-full mb-4 shadow-lg">
                <Handshake className="w-5 h-5" />
                <span className="font-medium text-sm">Partnerships for Excellence</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-4">
                Academic Alliance
              </h2>
            </div>

            {/* Content Card */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-50 to-blue-50/30">
              <CardContent className="pt-8 pb-8">
                <div className="space-y-6 text-gray-700 leading-relaxed text-base">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Handshake className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-2">Strategic Partnerships</p>
                      <p>
                        Seemycampus.com has established strategic academic alliances with leading educational institutions 
                        across India. These partnerships enable us to provide students with comprehensive information, 
                        streamlined admission processes, and access to quality education opportunities.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Globe className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-2">Comprehensive Network</p>
                      <p>
                        Our academic alliance program connects students to over 300 partner colleges and lists information 
                        on more than 60,000 institutions. We provide detailed information on admissions, entrance tests, 
                        infrastructure, courses, and career prospects, helping students make informed decisions about their 
                        educational journey.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-2">Student Support</p>
                      <p>
                        Through our partnerships, we offer customized student outreach programs and assist students with 
                        counseling and admission services. We help students find suitable colleges based on their academic 
                        background, skill-set, and potential, ensuring they make the right choice for their career.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-2">Mutual Benefits</p>
                      <p>
                        Our alliance partners benefit from our robust ed-tech platform, which facilitates student recruitment 
                        across all streams and degrees. We work together to create a seamless experience for students, 
                        from initial inquiry to enrollment and beyond.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-full mb-4 shadow-lg">
                <Award className="w-5 h-5" />
                <span className="font-medium text-sm">Benefits</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-4">
                Benefits of Our Academic Alliance
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white">
                <CardHeader className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-t-lg">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-white text-xl">For Students</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Access to comprehensive information on 60,000+ institutions</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Streamlined admission processes</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Personalized counseling and guidance</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Verified and authentic information</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white">
                <CardHeader className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-t-lg">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-white text-xl">For Institutions</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Enhanced student recruitment opportunities</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Access to a wide network of prospective students</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Marketing and promotional support</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Data-driven insights and analytics</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
