import { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Brain, Video, Users, BookOpen } from "lucide-react"

export const metadata: Metadata = {
  title: "Career Counselling | SeeMyCampus",
  description: "Get expert career counseling and guidance from Seemycampus.",
}

export default function CareerCounselingPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Career Counselling</h1>
        
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

        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Ready to take the next step in your career? Contact us to schedule a counseling session with our experts.
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

