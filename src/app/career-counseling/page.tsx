import { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Brain, Video, Users, BookOpen } from "lucide-react"
import { CounselingPackagesList } from "@/components/counseling/CounselingPackagesList"

export const metadata: Metadata = {
  title: "Career Counselling | SeeMyCampus",
  description: "Get expert career counseling and guidance from Seemycampus. Choose from our premium counseling packages.",
}

export default function CareerCounselingPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Career Counselling</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get personalized career guidance from expert counselors. Choose a package that fits your needs.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader>
              <Brain className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Psychometric Testing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Get comprehensive psychometric testing to understand your strengths, interests, and career preferences.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Video className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Video Calling Enabled</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Connect with our expert counselors through video calls for personalized guidance from anywhere.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Users className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Expert Guidance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Receive guidance from experienced career counselors who understand the Indian education system.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <BookOpen className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Personalized Approach</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Get tailored advice based on your academic background, interests, and career goals.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">Choose Your Package</h2>
          <CounselingPackagesList />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Have Questions?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Not sure which package is right for you? Contact us and we'll help you choose the best option for your needs.
            </p>
            <div className="flex gap-4">
              <Link href="/contact">
                <Button>Contact Us</Button>
              </Link>
              <Link href="/quiz">
                <Button variant="outline">Take Career Quiz</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

