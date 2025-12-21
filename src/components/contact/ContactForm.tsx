"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Mail, Building, MapPin, Pencil, Phone, List, Send, Calendar } from "lucide-react"

export function ContactForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    classYear: "",
    boardUniversity: "",
    contactNumber: "",
    city: "",
    interestedCourses: "",
    entranceExam: "",
    examScore: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log("Form submitted:", formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="bg-white">
      <h3 className="text-3xl font-bold text-gray-900 mb-8">Get In Touch</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Name */}
          <div className="space-y-2">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                className="pl-10 border-gray-300"
              />
            </div>
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                className="pl-10 border-gray-300"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Send className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-600" />
              <Input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="pl-10 pr-10 border-gray-300"
              />
            </div>
          </div>

          {/* Class/Year */}
          <div className="space-y-2">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                name="classYear"
                placeholder="Class/Year"
                value={formData.classYear}
                onChange={handleChange}
                className="pl-10 border-gray-300"
              />
            </div>
          </div>

          {/* Board/University */}
          <div className="space-y-2">
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                name="boardUniversity"
                placeholder="Board/University"
                value={formData.boardUniversity}
                onChange={handleChange}
                className="pl-10 border-gray-300"
              />
            </div>
          </div>

          {/* Contact Number */}
          <div className="space-y-2">
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="tel"
                name="contactNumber"
                placeholder="Contact Number"
                value={formData.contactNumber}
                onChange={handleChange}
                className="pl-10 border-gray-300"
              />
            </div>
          </div>

          {/* Your City */}
          <div className="space-y-2">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                name="city"
                placeholder="Your City"
                value={formData.city}
                onChange={handleChange}
                className="pl-10 border-gray-300"
              />
            </div>
          </div>

          {/* Interested Courses */}
          <div className="space-y-2">
            <div className="relative">
              <List className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                name="interestedCourses"
                placeholder="Interested Courses"
                value={formData.interestedCourses}
                onChange={handleChange}
                className="pl-10 border-gray-300"
              />
            </div>
          </div>

          {/* Any Entrance Exam Taken up */}
          <div className="space-y-2">
            <div className="relative">
              <Pencil className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                name="entranceExam"
                placeholder="Any Entrance Exam Taken up"
                value={formData.entranceExam}
                onChange={handleChange}
                className="pl-10 border-gray-300"
              />
            </div>
          </div>

          {/* Score of Entrance Exam */}
          <div className="space-y-2">
            <div className="relative">
              <Pencil className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                name="examScore"
                placeholder="Score of Entrance Exam"
                value={formData.examScore}
                onChange={handleChange}
                className="pl-10 border-gray-300"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 border border-gray-300 py-6 text-lg font-medium"
          >
            Submit
          </Button>
        </div>
      </form>
    </div>
  )
}

