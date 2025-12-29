"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, Home, Users, Loader2 } from "lucide-react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"

interface Infrastructure {
  id: number
  facilityType: string
  name: string
  description: string | null
  capacity: number | null
  images: string[]
  metadata: Record<string, any> | null
}

interface Hostel {
  id: number
  hostelName: string
  type: string
  capacity: number | null
  fees: number | null
  facilities: string[]
  rules: string | null
  images: string[]
}

interface Faculty {
  id: number
  name: string
  designation: string | null
  department: string | null
  qualifications: string | null
  experience: number | null
  email: string | null
  photo: string | null
  bio: string | null
  achievements: string[]
}

interface CollegeInfrastructureProps {
  collegeSlug: string
}

export function CollegeInfrastructure({ collegeSlug }: CollegeInfrastructureProps) {
  const [infrastructure, setInfrastructure] = useState<Infrastructure[]>([])
  const [hostels, setHostels] = useState<Hostel[]>([])
  const [faculty, setFaculty] = useState<Faculty[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [collegeSlug])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [infraRes, hostelsRes, facultyRes] = await Promise.all([
        fetch(`/api/colleges/${collegeSlug}/infrastructure`),
        fetch(`/api/colleges/${collegeSlug}/hostels`),
        fetch(`/api/colleges/${collegeSlug}/faculty`),
      ])

      if (infraRes.ok) {
        const infraData = await infraRes.json()
        setInfrastructure(infraData.infrastructure || [])
      }

      if (hostelsRes.ok) {
        const hostelsData = await hostelsRes.json()
        setHostels(hostelsData.hostels || [])
      }

      if (facultyRes.ok) {
        const facultyData = await facultyRes.json()
        setFaculty(facultyData.faculty || [])
      }
    } catch (error) {
      console.error("Error fetching infrastructure data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Group infrastructure by type
  const infrastructureByType = infrastructure.reduce((acc, item) => {
    if (!acc[item.facilityType]) {
      acc[item.facilityType] = []
    }
    acc[item.facilityType].push(item)
    return acc
  }, {} as Record<string, Infrastructure[]>)

  // Group faculty by department
  const facultyByDepartment = faculty.reduce((acc, member) => {
    const dept = member.department || "Other"
    if (!acc[dept]) {
      acc[dept] = []
    }
    acc[dept].push(member)
    return acc
  }, {} as Record<string, Faculty[]>)

  if (loading) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Infrastructure & Facilities</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading infrastructure data...</span>
        </CardContent>
      </Card>
    )
  }

  const hasData = infrastructure.length > 0 || hostels.length > 0 || faculty.length > 0

  if (!hasData) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Infrastructure & Facilities</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No infrastructure data available for this college yet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-2xl">Infrastructure & Facilities</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="infrastructure" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="infrastructure">
              <Building2 className="h-4 w-4 mr-2" />
              Facilities
            </TabsTrigger>
            <TabsTrigger value="hostels">
              <Home className="h-4 w-4 mr-2" />
              Hostels
            </TabsTrigger>
            <TabsTrigger value="faculty">
              <Users className="h-4 w-4 mr-2" />
              Faculty
            </TabsTrigger>
          </TabsList>

          <TabsContent value="infrastructure" className="space-y-6">
            {Object.keys(infrastructureByType).length === 0 ? (
              <p className="text-muted-foreground">No infrastructure data available.</p>
            ) : (
              Object.entries(infrastructureByType).map(([type, facilities]) => (
                <div key={type} className="space-y-4">
                  <h3 className="text-lg font-semibold capitalize">{type}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {facilities.map((facility) => (
                      <Card key={facility.id} className="overflow-hidden">
                        {facility.images && facility.images.length > 0 && (
                          <div className="relative h-48 w-full">
                            <Image
                              src={facility.images[0]}
                              alt={facility.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <CardHeader>
                          <CardTitle className="text-base">{facility.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {facility.description && (
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {facility.description}
                            </p>
                          )}
                          {facility.capacity && (
                            <p className="text-sm">
                              <span className="font-medium">Capacity:</span> {facility.capacity}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="hostels" className="space-y-4">
            {hostels.length === 0 ? (
              <p className="text-muted-foreground">No hostel information available.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hostels.map((hostel) => (
                  <Card key={hostel.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{hostel.hostelName}</CardTitle>
                        <Badge variant="outline" className="capitalize">
                          {hostel.type}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {hostel.capacity && (
                        <p className="text-sm">
                          <span className="font-medium">Capacity:</span> {hostel.capacity} beds
                        </p>
                      )}
                      {hostel.fees && (
                        <p className="text-sm">
                          <span className="font-medium">Fees:</span> ₹{hostel.fees.toLocaleString()}/year
                        </p>
                      )}
                      {hostel.facilities && hostel.facilities.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-1">Facilities:</p>
                          <div className="flex flex-wrap gap-1">
                            {hostel.facilities.map((facility, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {facility}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {hostel.rules && (
                        <div>
                          <p className="text-sm font-medium mb-1">Rules:</p>
                          <p className="text-sm text-muted-foreground line-clamp-3">{hostel.rules}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="faculty" className="space-y-6">
            {Object.keys(facultyByDepartment).length === 0 ? (
              <p className="text-muted-foreground">No faculty information available.</p>
            ) : (
              Object.entries(facultyByDepartment).map(([department, members]) => (
                <div key={department} className="space-y-4">
                  <h3 className="text-lg font-semibold">{department}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {members.map((member) => (
                      <Card key={member.id}>
                        <CardHeader>
                          <div className="flex items-start gap-3">
                            {member.photo ? (
                              <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                                <Image
                                  src={member.photo}
                                  alt={member.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold flex-shrink-0">
                                {member.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-base">{member.name}</CardTitle>
                              {member.designation && (
                                <p className="text-sm text-muted-foreground">{member.designation}</p>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {member.qualifications && (
                            <p className="text-sm">
                              <span className="font-medium">Qualifications:</span> {member.qualifications}
                            </p>
                          )}
                          {member.experience && (
                            <p className="text-sm">
                              <span className="font-medium">Experience:</span> {member.experience} years
                            </p>
                          )}
                          {member.bio && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{member.bio}</p>
                          )}
                          {member.achievements && member.achievements.length > 0 && (
                            <div>
                              <p className="text-sm font-medium mb-1">Achievements:</p>
                              <ul className="text-xs text-muted-foreground list-disc list-inside">
                                {member.achievements.slice(0, 3).map((achievement, idx) => (
                                  <li key={idx}>{achievement}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

