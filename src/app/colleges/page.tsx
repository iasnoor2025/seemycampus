import { getAllColleges } from "@/lib/colleges"
import { CollegeCard } from "@/components/college/CollegeCard"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Browse Colleges | SeeMyCampus",
  description: "Discover top colleges and universities. Find the perfect institution for your educational journey.",
  keywords: ["colleges", "universities", "education", "admissions"],
}

export default async function CollegesPage() {
  const collegesList = await getAllColleges()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Browse Colleges</h1>
        <p className="text-lg text-muted-foreground">
          Explore our curated list of colleges and find the perfect match for your educational goals.
        </p>
      </div>

      {collegesList.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No colleges found. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collegesList.map((college) => (
            <CollegeCard
              key={college.id}
              id={college.id}
              name={college.name}
              slug={college.slug}
              location={college.location}
              city={college.city}
              description={college.description}
              images={college.images}
            />
          ))}
        </div>
      )}
    </div>
  )
}

