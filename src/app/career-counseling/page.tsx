import { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Brain, Video, Users, BookOpen, Sparkles, Target, MessageCircle, Award } from "lucide-react"
import { CounselingPackagesList } from "@/components/counseling/CounselingPackagesList"

export const metadata: Metadata = {
  title: "Career Counselling | SeeMyCampus",
  description: "Get expert career counseling and guidance from Seemycampus. Choose from our premium counseling packages.",
}

export default function CareerCounselingPage() {
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
              <Target className="w-5 h-5" />
              <span className="font-medium text-sm">Expert Guidance</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-indigo-100 bg-clip-text text-transparent">
              Career Counselling
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Get personalized career guidance from expert counselors. Choose a package that fits your needs.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-full mb-4 shadow-lg">
              <Sparkles className="w-5 h-5" />
              <span className="font-medium text-sm">Why Choose Us</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
              Our Services
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white">
              <CardHeader className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-t-lg">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-white text-xl font-bold text-center">Psychometric Testing</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-700 leading-relaxed">
                  Get comprehensive psychometric testing to understand your strengths, interests, and career preferences.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white">
              <CardHeader className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-t-lg">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Video className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-white text-xl font-bold text-center">Video Calling Enabled</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-700 leading-relaxed">
                  Connect with our expert counselors through video calls for personalized guidance from anywhere.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white">
              <CardHeader className="bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-t-lg">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-white text-xl font-bold text-center">Expert Guidance</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-700 leading-relaxed">
                  Receive guidance from experienced career counselors who understand the Indian education system.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white">
              <CardHeader className="bg-gradient-to-br from-teal-500 to-emerald-600 text-white rounded-t-lg">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-white text-xl font-bold text-center">Personalized Approach</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-700 leading-relaxed">
                  Get tailored advice based on your academic background, interests, and career goals.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-full mb-4 shadow-lg">
              <Award className="w-5 h-5" />
              <span className="font-medium text-sm">Choose Your Plan</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-4">
              Choose Your Package
            </h2>
            <p className="text-gray-600 text-lg">
              Select the perfect counseling package for your career journey
            </p>
          </div>
          <CounselingPackagesList />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-50 to-blue-50/30">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-6 h-6" />
                <CardTitle className="text-white text-2xl">Have Questions?</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-gray-700 text-lg leading-relaxed">
                Not sure which package is right for you? Contact us and we'll help you choose the best option for your needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/contact" className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-md hover:shadow-lg transition-all">
                    Contact Us
                  </Button>
                </Link>
                <Link href="/quiz" className="flex-1">
                  <Button variant="outline" className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold">
                    Take Career Quiz
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

