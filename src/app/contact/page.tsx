import { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, Mail, MapPin, Globe } from "lucide-react"

export const metadata: Metadata = {
  title: "Contact Us | SeeMyCampus",
  description: "Get in touch with Seemycampus for college admissions counseling and guidance.",
}

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Contact Us</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                B-127 Sector 2<br />
                Noida 201301<br />
                Uttar Pradesh, India
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Phone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                <a href="tel:+919648983131" className="hover:text-primary">
                  +91 96489 83131
                </a>
                <br />
                <a href="tel:+918960147776" className="hover:text-primary">
                  +91 89601 47776
                </a>
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                <a href="mailto:info@seemycampus.com" className="hover:text-primary">
                  info@seemycampus.com
                </a>
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Website
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                <a href="https://www.seemycampus.com" className="hover:text-primary" target="_blank" rel="noopener noreferrer">
                  www.seemycampus.com
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

