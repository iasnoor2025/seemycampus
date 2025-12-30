import { Metadata } from "next"
import { Shield, Lock, Eye, FileText, Users, Database, Cookie, Mail } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://seemycampus.com"

export const metadata: Metadata = {
  title: "Privacy Policy | SeeMyCampus",
  description: "Read our privacy policy to understand how SeeMyCampus collects, uses, and protects your personal information.",
  keywords: ["privacy policy", "data protection", "user privacy", "SeeMyCampus privacy"],
  openGraph: {
    title: "Privacy Policy | SeeMyCampus",
    description: "Read our privacy policy to understand how SeeMyCampus collects, uses, and protects your personal information.",
    url: `${baseUrl}/privacy-policy`,
  },
  alternates: {
    canonical: `${baseUrl}/privacy-policy`,
  },
}

export default function PrivacyPolicyPage() {
  const lastUpdated = "January 2025"

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
              <Shield className="w-5 h-5" />
              <span className="font-medium text-sm">Your Privacy Matters</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-indigo-100 bg-clip-text text-transparent">
              Privacy Policy
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              We are committed to protecting your privacy and ensuring the security of your personal information.
            </p>
            <p className="text-sm text-white/70 mt-4">Last Updated: {lastUpdated}</p>
          </div>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-8">
            {/* Introduction */}
            <Card className="border-0 shadow-xl bg-white">
              <CardContent className="pt-8 pb-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Introduction</h2>
                    <p className="text-gray-700 leading-relaxed">
                      Welcome to SeeMyCampus ("we," "our," or "us"). This Privacy Policy explains how we collect, use, 
                      disclose, and safeguard your information when you visit our website <strong>seemycampus.com</strong>{" "}
                      and use our services. Please read this privacy policy carefully. If you do not agree with the terms 
                      of this privacy policy, please do not access the site.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Information We Collect */}
            <Card className="border-0 shadow-xl bg-white">
              <CardContent className="pt-8 pb-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Database className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Personal Information</h3>
                        <p className="text-gray-700 leading-relaxed mb-2">
                          We may collect personal information that you voluntarily provide to us when you:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                          <li>Register for an account or create a profile</li>
                          <li>Fill out forms on our website (contact forms, quiz forms, counseling bookings)</li>
                          <li>Subscribe to our newsletter</li>
                          <li>Participate in surveys or feedback</li>
                          <li>Contact us for support or inquiries</li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed mt-3">
                          This information may include: name, email address, phone number, academic background, 
                          career interests, and other information you choose to provide.
                        </p>
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Automatically Collected Information</h3>
                        <p className="text-gray-700 leading-relaxed mb-2">
                          When you visit our website, we automatically collect certain information about your device, including:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                          <li>IP address and location data</li>
                          <li>Browser type and version</li>
                          <li>Operating system</li>
                          <li>Pages visited and time spent on pages</li>
                          <li>Referring website addresses</li>
                          <li>Cookies and similar tracking technologies</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* How We Use Your Information */}
            <Card className="border-0 shadow-xl bg-white">
              <CardContent className="pt-8 pb-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      We use the information we collect for various purposes, including:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                      <li><strong>Service Delivery:</strong> To provide, maintain, and improve our services, including college recommendations, counseling services, and educational content</li>
                      <li><strong>Personalization:</strong> To personalize your experience and provide content and features relevant to your interests</li>
                      <li><strong>Communication:</strong> To send you updates, newsletters, respond to inquiries, and provide customer support</li>
                      <li><strong>Analytics:</strong> To analyze usage patterns, improve our website, and understand user preferences</li>
                      <li><strong>Legal Compliance:</strong> To comply with legal obligations and protect our rights and interests</li>
                      <li><strong>Marketing:</strong> To send promotional materials (with your consent) about our services and educational opportunities</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Information Sharing */}
            <Card className="border-0 shadow-xl bg-white">
              <CardContent className="pt-8 pb-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Information Sharing and Disclosure</h2>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      We do not sell your personal information. We may share your information in the following circumstances:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                      <li><strong>Service Providers:</strong> With third-party service providers who perform services on our behalf (hosting, analytics, email services)</li>
                      <li><strong>Academic Partners:</strong> With partner colleges and educational institutions (with your consent) to facilitate admissions and counseling</li>
                      <li><strong>Legal Requirements:</strong> When required by law, court order, or government regulation</li>
                      <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                      <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your information</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Security */}
            <Card className="border-0 shadow-xl bg-white">
              <CardContent className="pt-8 pb-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Lock className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
                    <p className="text-gray-700 leading-relaxed">
                      We implement appropriate technical and organizational security measures to protect your personal 
                      information against unauthorized access, alteration, disclosure, or destruction. These measures include:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-3">
                      <li>Encryption of data in transit and at rest</li>
                      <li>Regular security assessments and updates</li>
                      <li>Access controls and authentication mechanisms</li>
                      <li>Secure hosting infrastructure</li>
                      <li>Regular backups and disaster recovery procedures</li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed mt-4">
                      However, no method of transmission over the Internet or electronic storage is 100% secure. 
                      While we strive to use commercially acceptable means to protect your information, we cannot 
                      guarantee absolute security.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cookies */}
            <Card className="border-0 shadow-xl bg-white">
              <CardContent className="pt-8 pb-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Cookie className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies and Tracking Technologies</h2>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      We use cookies and similar tracking technologies to track activity on our website and store 
                      certain information. Cookies are files with a small amount of data that are commonly used as 
                      anonymous unique identifiers.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      Types of cookies we use:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                      <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
                      <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website</li>
                      <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                      <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements (with your consent)</li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed mt-4">
                      You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. 
                      However, if you do not accept cookies, you may not be able to use some portions of our website.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Your Rights */}
            <Card className="border-0 shadow-xl bg-white">
              <CardContent className="pt-8 pb-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights and Choices</h2>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      You have the following rights regarding your personal information:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                      <li><strong>Access:</strong> Request access to the personal information we hold about you</li>
                      <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                      <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal requirements)</li>
                      <li><strong>Objection:</strong> Object to processing of your personal information for certain purposes</li>
                      <li><strong>Data Portability:</strong> Request transfer of your data to another service provider</li>
                      <li><strong>Withdraw Consent:</strong> Withdraw your consent at any time where we rely on consent</li>
                      <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications at any time</li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed mt-4">
                      To exercise these rights, please contact us using the information provided in the "Contact Us" section below.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Children's Privacy */}
            <Card className="border-0 shadow-xl bg-white">
              <CardContent className="pt-8 pb-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Children's Privacy</h2>
                    <p className="text-gray-700 leading-relaxed">
                      Our services are intended for students who are at least 13 years old. We do not knowingly collect 
                      personal information from children under 13. If you are a parent or guardian and believe your child 
                      has provided us with personal information, please contact us immediately. If we become aware that 
                      we have collected personal information from a child under 13, we will take steps to delete such 
                      information from our servers.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Third-Party Links */}
            <Card className="border-0 shadow-xl bg-white">
              <CardContent className="pt-8 pb-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Links</h2>
                    <p className="text-gray-700 leading-relaxed">
                      Our website may contain links to third-party websites, including college websites, educational 
                      institutions, and other resources. We are not responsible for the privacy practices or content 
                      of these third-party sites. We encourage you to read the privacy policies of any third-party 
                      sites you visit.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Changes to Privacy Policy */}
            <Card className="border-0 shadow-xl bg-white">
              <CardContent className="pt-8 pb-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Privacy Policy</h2>
                    <p className="text-gray-700 leading-relaxed">
                      We may update our Privacy Policy from time to time. We will notify you of any changes by posting 
                      the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to 
                      review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are 
                      effective when they are posted on this page.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Us */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-50 to-blue-50/30">
              <CardContent className="pt-8 pb-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      If you have any questions, concerns, or requests regarding this Privacy Policy or our data 
                      practices, please contact us:
                    </p>
                    <div className="bg-white rounded-lg p-6 border border-slate-200">
                      <p className="text-gray-700 mb-2">
                        <strong>Email:</strong>{" "}
                        <a href="mailto:privacy@seemycampus.com" className="text-blue-600 hover:text-blue-700">
                          privacy@seemycampus.com
                        </a>
                      </p>
                      <p className="text-gray-700 mb-2">
                        <strong>Website:</strong>{" "}
                        <a href="https://www.seemycampus.com" className="text-blue-600 hover:text-blue-700">
                          www.seemycampus.com
                        </a>
                      </p>
                      <p className="text-gray-700">
                        <strong>Address:</strong> New Delhi, India
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}

