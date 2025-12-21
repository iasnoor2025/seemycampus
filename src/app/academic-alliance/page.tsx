import { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Academic Alliance | SeeMyCampus",
  description: "Learn about our academic partnerships and alliances.",
}

export default function AcademicAlliancePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Academic Alliance</h1>
        <Card>
          <CardHeader>
            <CardTitle>Partnerships for Excellence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Seemycampus partners with leading educational institutions across India to provide students 
              with access to the best educational opportunities.
            </p>
            <p>
              Our academic alliances enable us to offer comprehensive information about over 60,000 institutions 
              and 375,000+ courses, ensuring students have all the resources they need to make informed decisions.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

