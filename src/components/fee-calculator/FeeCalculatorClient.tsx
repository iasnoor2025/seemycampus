"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, TrendingUp, Info } from "lucide-react"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

export function FeeCalculatorClient() {
  const [formData, setFormData] = useState({
    courseDuration: "4", // years
    tuitionFee: "",
    tuitionFeeType: "yearly", // yearly, semester, monthly
    hostelFee: "",
    hostelFeeType: "yearly",
    messFee: "",
    messFeeType: "yearly",
    libraryFee: "",
    libraryFeeType: "yearly",
    labFee: "",
    labFeeType: "yearly",
    examFee: "",
    examFeeType: "yearly",
    otherFees: "",
    otherFeesType: "yearly",
    scholarshipAmount: "",
    scholarshipType: "fixed", // fixed, percentage
    currency: "INR",
  })

  const [results, setResults] = useState<{
    totalTuition: number
    totalHostel: number
    totalMess: number
    totalLibrary: number
    totalLab: number
    totalExam: number
    totalOther: number
    totalFees: number
    scholarshipDeduction: number
    finalAmount: number
    perYear: number
    perMonth: number
  } | null>(null)

  const calculateFee = (amount: string, type: string, duration: number): number => {
    const fee = parseFloat(amount) || 0
    if (fee === 0) return 0

    switch (type) {
      case "yearly":
        return fee * duration
      case "semester":
        return fee * duration * 2 // 2 semesters per year
      case "monthly":
        return fee * duration * 12
      default:
        return fee * duration
    }
  }

  const calculateScholarship = (
    amount: string,
    type: string,
    totalFees: number
  ): number => {
    const scholarship = parseFloat(amount) || 0
    if (scholarship === 0) return 0

    if (type === "percentage") {
      return (totalFees * scholarship) / 100
    } else {
      return scholarship
    }
  }

  const handleCalculate = () => {
    const duration = parseFloat(formData.courseDuration) || 0
    if (duration === 0) {
      alert("Please enter course duration")
      return
    }

    const totalTuition = calculateFee(
      formData.tuitionFee,
      formData.tuitionFeeType,
      duration
    )
    const totalHostel = calculateFee(
      formData.hostelFee,
      formData.hostelFeeType,
      duration
    )
    const totalMess = calculateFee(
      formData.messFee,
      formData.messFeeType,
      duration
    )
    const totalLibrary = calculateFee(
      formData.libraryFee,
      formData.libraryFeeType,
      duration
    )
    const totalLab = calculateFee(
      formData.labFee,
      formData.labFeeType,
      duration
    )
    const totalExam = calculateFee(
      formData.examFee,
      formData.examFeeType,
      duration
    )
    const totalOther = calculateFee(
      formData.otherFees,
      formData.otherFeesType,
      duration
    )

    const totalFees =
      totalTuition +
      totalHostel +
      totalMess +
      totalLibrary +
      totalLab +
      totalExam +
      totalOther

    const scholarshipDeduction = calculateScholarship(
      formData.scholarshipAmount,
      formData.scholarshipType,
      totalFees
    )

    const finalAmount = totalFees - scholarshipDeduction
    const perYear = totalFees / duration
    const perMonth = perYear / 12

    setResults({
      totalTuition,
      totalHostel,
      totalMess,
      totalLibrary,
      totalLab,
      totalExam,
      totalOther,
      totalFees,
      scholarshipDeduction,
      finalAmount,
      perYear,
      perMonth,
    })
  }

  const formatCurrency = (amount: number) => {
    const symbol = formData.currency === "INR" ? "₹" : formData.currency
    return `${symbol}${amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Input Form */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Fee Details
            </CardTitle>
            <CardDescription>
              Enter all fee components to calculate total cost
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Course Duration */}
            <div>
              <Label htmlFor="courseDuration">Course Duration (Years) *</Label>
              <Input
                id="courseDuration"
                type="number"
                min="1"
                step="0.5"
                value={formData.courseDuration}
                onChange={(e) =>
                  setFormData({ ...formData, courseDuration: e.target.value })
                }
                placeholder="e.g., 4"
              />
            </div>

            {/* Currency */}
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) =>
                  setFormData({ ...formData, currency: value || "INR" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                  <SelectItem value="USD">USD (₹)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tuition Fee */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tuitionFee">Tuition Fee</Label>
                <Input
                  id="tuitionFee"
                  type="number"
                  value={formData.tuitionFee}
                  onChange={(e) =>
                    setFormData({ ...formData, tuitionFee: e.target.value })
                  }
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="tuitionFeeType">Frequency</Label>
                <Select
                  value={formData.tuitionFeeType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, tuitionFeeType: value || "yearly" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yearly">Per Year</SelectItem>
                    <SelectItem value="semester">Per Semester</SelectItem>
                    <SelectItem value="monthly">Per Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Hostel Fee */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hostelFee">Hostel Fee</Label>
                <Input
                  id="hostelFee"
                  type="number"
                  value={formData.hostelFee}
                  onChange={(e) =>
                    setFormData({ ...formData, hostelFee: e.target.value })
                  }
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="hostelFeeType">Frequency</Label>
                <Select
                  value={formData.hostelFeeType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, hostelFeeType: value || "yearly" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yearly">Per Year</SelectItem>
                    <SelectItem value="semester">Per Semester</SelectItem>
                    <SelectItem value="monthly">Per Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Mess Fee */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="messFee">Mess/Food Fee</Label>
                <Input
                  id="messFee"
                  type="number"
                  value={formData.messFee}
                  onChange={(e) =>
                    setFormData({ ...formData, messFee: e.target.value })
                  }
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="messFeeType">Frequency</Label>
                <Select
                  value={formData.messFeeType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, messFeeType: value || "yearly" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yearly">Per Year</SelectItem>
                    <SelectItem value="semester">Per Semester</SelectItem>
                    <SelectItem value="monthly">Per Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Library Fee */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="libraryFee">Library Fee</Label>
                <Input
                  id="libraryFee"
                  type="number"
                  value={formData.libraryFee}
                  onChange={(e) =>
                    setFormData({ ...formData, libraryFee: e.target.value })
                  }
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="libraryFeeType">Frequency</Label>
                <Select
                  value={formData.libraryFeeType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, libraryFeeType: value || "yearly" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yearly">Per Year</SelectItem>
                    <SelectItem value="semester">Per Semester</SelectItem>
                    <SelectItem value="monthly">Per Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Lab Fee */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="labFee">Laboratory Fee</Label>
                <Input
                  id="labFee"
                  type="number"
                  value={formData.labFee}
                  onChange={(e) =>
                    setFormData({ ...formData, labFee: e.target.value })
                  }
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="labFeeType">Frequency</Label>
                <Select
                  value={formData.labFeeType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, labFeeType: value || "yearly" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yearly">Per Year</SelectItem>
                    <SelectItem value="semester">Per Semester</SelectItem>
                    <SelectItem value="monthly">Per Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Exam Fee */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="examFee">Examination Fee</Label>
                <Input
                  id="examFee"
                  type="number"
                  value={formData.examFee}
                  onChange={(e) =>
                    setFormData({ ...formData, examFee: e.target.value })
                  }
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="examFeeType">Frequency</Label>
                <Select
                  value={formData.examFeeType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, examFeeType: value || "yearly" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yearly">Per Year</SelectItem>
                    <SelectItem value="semester">Per Semester</SelectItem>
                    <SelectItem value="monthly">Per Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Other Fees */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="otherFees">Other Fees</Label>
                <Input
                  id="otherFees"
                  type="number"
                  value={formData.otherFees}
                  onChange={(e) =>
                    setFormData({ ...formData, otherFees: e.target.value })
                  }
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="otherFeesType">Frequency</Label>
                <Select
                  value={formData.otherFeesType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, otherFeesType: value || "yearly" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yearly">Per Year</SelectItem>
                    <SelectItem value="semester">Per Semester</SelectItem>
                    <SelectItem value="monthly">Per Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Scholarship */}
            <div className="pt-4 border-t">
              <h3 className="text-lg font-semibold mb-4">Scholarship/Discount (Optional)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="scholarshipAmount">Scholarship Amount</Label>
                  <Input
                    id="scholarshipAmount"
                    type="number"
                    value={formData.scholarshipAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, scholarshipAmount: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="scholarshipType">Type</Label>
                  <Select
                    value={formData.scholarshipType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, scholarshipType: value || "fixed" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Button onClick={handleCalculate} className="w-full" size="lg">
              <Calculator className="h-4 w-4 mr-2" />
              Calculate Total Cost
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      <div className="lg:col-span-1">
        {results ? (
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Cost Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tuition Fee:</span>
                  <span className="font-medium">{formatCurrency(results.totalTuition)}</span>
                </div>
                {results.totalHostel > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hostel Fee:</span>
                    <span className="font-medium">{formatCurrency(results.totalHostel)}</span>
                  </div>
                )}
                {results.totalMess > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mess Fee:</span>
                    <span className="font-medium">{formatCurrency(results.totalMess)}</span>
                  </div>
                )}
                {results.totalLibrary > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Library Fee:</span>
                    <span className="font-medium">{formatCurrency(results.totalLibrary)}</span>
                  </div>
                )}
                {results.totalLab > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lab Fee:</span>
                    <span className="font-medium">{formatCurrency(results.totalLab)}</span>
                  </div>
                )}
                {results.totalExam > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Exam Fee:</span>
                    <span className="font-medium">{formatCurrency(results.totalExam)}</span>
                  </div>
                )}
                {results.totalOther > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Other Fees:</span>
                    <span className="font-medium">{formatCurrency(results.totalOther)}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between text-base">
                  <span className="font-semibold">Total Fees:</span>
                  <span className="font-bold">{formatCurrency(results.totalFees)}</span>
                </div>
                {results.scholarshipDeduction > 0 && (
                  <>
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Scholarship:</span>
                      <span>-{formatCurrency(results.scholarshipDeduction)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-green-600 pt-2 border-t">
                      <span>Final Amount:</span>
                      <span>{formatCurrency(results.finalAmount)}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Per Year:</span>
                  <span className="font-medium">{formatCurrency(results.perYear)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Per Month:</span>
                  <span className="font-medium">{formatCurrency(results.perMonth)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Ready to Calculate</AlertTitle>
                <AlertDescription>
                  Fill in the fee details and click "Calculate Total Cost" to see the breakdown.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

