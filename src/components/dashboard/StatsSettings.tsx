
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Save, Loader2, BarChart3, Layout } from "lucide-react"

export function StatsSettings() {
    const { toast } = useToast()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [stats, setStats] = useState({
        hero_stats_colleges: "60,000+",
        hero_stats_courses: "375,000+",
        hero_stats_students: "50,000+",
        hero_stats_counselors: "100+",
    })

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            const response = await fetch("/api/admin/site-settings?keys=hero_stats_colleges,hero_stats_courses,hero_stats_students,hero_stats_counselors")
            if (response.ok) {
                const data = await response.json()
                setStats(prev => ({
                    ...prev,
                    ...data
                }))
            }
        } catch (error) {
            console.error("Error fetching settings:", error)
            toast({
                title: "Error",
                description: "Failed to load settings",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const response = await fetch("/api/admin/site-settings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(stats),
            })

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Settings saved successfully",
                })
            } else {
                throw new Error("Failed to save settings")
            }
        } catch (error) {
            console.error("Error saving settings:", error)
            toast({
                title: "Error",
                description: "Failed to save settings",
                variant: "destructive",
            })
        } finally {
            setSaving(false)
        }
    }

    return (
        <Card className="border-0 shadow-sm bg-white rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-slate-50/50 pb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                        <Layout className="w-5 h-5" />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-black text-slate-800 uppercase tracking-tight">Homepage Statistics</CardTitle>
                        <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                            Update the valid counters shown on the hero section
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-8">
                <form onSubmit={handleSave} className="space-y-8">
                    {loading ? (
                        <div className="flex items-center justify-center p-8">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600/20" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-3">
                                <Label htmlFor="colleges" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Colleges</Label>
                                <div className="relative group">
                                    <Input
                                        id="colleges"
                                        value={stats.hero_stats_colleges}
                                        onChange={(e) => setStats({ ...stats, hero_stats_colleges: e.target.value })}
                                        placeholder="e.g. 60,000+"
                                        className="h-12 bg-slate-50 border-none rounded-2xl px-4 font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/10 transition-all"
                                    />
                                    <div className="absolute right-3 top-3 p-1.5 bg-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-sm">
                                        <BarChart3 className="w-3 h-3 text-blue-500" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="courses" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Courses</Label>
                                <div className="relative group">
                                    <Input
                                        id="courses"
                                        value={stats.hero_stats_courses}
                                        onChange={(e) => setStats({ ...stats, hero_stats_courses: e.target.value })}
                                        placeholder="e.g. 375,000+"
                                        className="h-12 bg-slate-50 border-none rounded-2xl px-4 font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/10 transition-all"
                                    />
                                    <div className="absolute right-3 top-3 p-1.5 bg-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-sm">
                                        <BarChart3 className="w-3 h-3 text-purple-500" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="students" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Students Helped</Label>
                                <div className="relative group">
                                    <Input
                                        id="students"
                                        value={stats.hero_stats_students}
                                        onChange={(e) => setStats({ ...stats, hero_stats_students: e.target.value })}
                                        placeholder="e.g. 50,000+"
                                        className="h-12 bg-slate-50 border-none rounded-2xl px-4 font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/10 transition-all"
                                    />
                                    <div className="absolute right-3 top-3 p-1.5 bg-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-sm">
                                        <BarChart3 className="w-3 h-3 text-pink-500" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="counselors" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Expert Counselors</Label>
                                <div className="relative group">
                                    <Input
                                        id="counselors"
                                        value={stats.hero_stats_counselors}
                                        onChange={(e) => setStats({ ...stats, hero_stats_counselors: e.target.value })}
                                        placeholder="e.g. 100+"
                                        className="h-12 bg-slate-50 border-none rounded-2xl px-4 font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/10 transition-all"
                                    />
                                    <div className="absolute right-3 top-3 p-1.5 bg-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-sm">
                                        <BarChart3 className="w-3 h-3 text-teal-500" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end pt-4 border-t border-slate-100">
                        <Button
                            type="submit"
                            disabled={loading || saving}
                            className="bg-slate-900 hover:bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] h-12 px-8 rounded-2xl transition-all shadow-lg hover:shadow-blue-500/20"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Save className="w-3.5 h-3.5 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
