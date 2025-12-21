import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, GraduationCap, DollarSign } from "lucide-react"

interface CourseCardProps {
  id: number
  name: string
  slug: string
  description?: string | null
  duration?: string | null
  fees?: number | null
  feesCurrency?: string | null
  studyMode?: string | null
  level?: string | null
}

export function CourseCard({
  name,
  slug,
  description,
  duration,
  fees,
  feesCurrency = "INR",
  studyMode,
  level,
}: CourseCardProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="line-clamp-2">{name}</CardTitle>
        {level && (
          <CardDescription className="flex items-center gap-1">
            <GraduationCap className="h-4 w-4" />
            {level}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-grow">
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{description}</p>
        )}
        <div className="space-y-2 text-sm">
          {duration && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{duration}</span>
            </div>
          )}
          {fees && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>{formatCurrency(fees, feesCurrency || "INR")}</span>
            </div>
          )}
          {studyMode && (
            <div className="text-muted-foreground">
              <span className="capitalize">{studyMode}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/courses/${slug}`} className="w-full">
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

