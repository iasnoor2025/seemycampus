"use client"

import { useState, useEffect } from "react"
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    Loader2,
    Trophy,
    Brain,
    Rocket
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import SkillForm from "./SkillForm"

interface Skill {
    id: number
    name: string
    slug: string
    category: string
    description?: string
    icon?: string
    isActive: boolean
    createdAt: string
}

export default function SkillsList() {
    const { data: session } = useSession()
    const [skills, setSkills] = useState<Skill[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [categoryFilter, setCategoryFilter] = useState("all")
    const [showForm, setShowForm] = useState(false)
    const [editingSkill, setEditingSkill] = useState<Skill | undefined>(undefined)

    const fetchSkills = async () => {
        try {
            setLoading(true)
            const response = await fetch("/api/dashboard/skills?all=true")
            const data = await response.json()
            setSkills(data.skills || [])
        } catch (error) {
            console.error("Error fetching skills:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSkills()
    }, [])

    const filteredSkills = skills.filter(skill => {
        const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            skill.slug.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = categoryFilter === "all" || skill.category === categoryFilter
        return matchesSearch && matchesCategory
    })

    const handleAdd = () => {
        setEditingSkill(undefined)
        setShowForm(true)
    }

    const handleEdit = (skill: Skill) => {
        setEditingSkill(skill)
        setShowForm(true)
    }

    const handleFormSuccess = () => {
        setShowForm(false)
        fetchSkills()
    }

    const handleToggleActive = async (id: number, currentStatus: boolean) => {
        try {
            const response = await fetch(`/api/dashboard/skills/${id}`, {
                method: "PATCH",
                body: JSON.stringify({ isActive: !currentStatus }),
            })
            if (response.ok) {
                setSkills(skills.map(s => s.id === id ? { ...s, isActive: !currentStatus } : s))
            }
        } catch (error) {
            console.error("Error toggling skill status:", error)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to retire this skill?")) return
        try {
            const response = await fetch(`/api/dashboard/skills/${id}`, {
                method: "DELETE",
            })
            if (response.ok) {
                setSkills(skills.filter(s => s.id !== id))
            }
        } catch (error) {
            console.error("Error deleting skill:", error)
        }
    }

    const getCategoryIcon = (category: string) => {
        switch (category?.toLowerCase()) {
            case "academic": return <Brain className="h-4 w-4" />
            case "professional": return <Trophy className="h-4 w-4" />
            case "career": return <Rocket className="h-4 w-4" />
            default: return <Brain className="h-4 w-4" />
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Syncing Intelligence</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Skill Intelligence Hub - Single Row */}
            <div className="bg-white p-3 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.04)] border border-slate-100/50">
                <div className="flex flex-row items-center gap-3 flex-nowrap">
                    {/* Search - Flexible */}
                    <div className="relative flex-1 min-w-0 group">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-3 py-3 bg-slate-50 border-none rounded-[1.5rem] focus:ring-2 focus:ring-blue-500/20 text-[11px] font-bold uppercase tracking-wider text-slate-700 placeholder:text-slate-400 transition-all"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center border border-slate-100">
                            <Search className="h-3 w-3 text-slate-400" />
                        </div>
                    </div>

                    {/* Domain Filter */}
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="h-12 w-[160px] bg-slate-50 border-none rounded-[1.5rem] text-[9px] font-black uppercase tracking-widest px-3 hover:bg-slate-100 transition-all flex-shrink-0">
                            <SelectValue placeholder="Domain" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                            <SelectItem value="all" className="text-[10px] font-bold uppercase tracking-widest">All Domains</SelectItem>
                            <SelectItem value="academic" className="text-[10px] font-bold uppercase tracking-widest">Academic</SelectItem>
                            <SelectItem value="professional" className="text-[10px] font-bold uppercase tracking-widest">Professional</SelectItem>
                            <SelectItem value="career" className="text-[10px] font-bold uppercase tracking-widest">Career</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Add Button */}
                    <Button
                        className="h-12 px-5 bg-slate-900 hover:bg-blue-600 text-white rounded-[1.5rem] transition-all duration-500 shadow-xl hover:shadow-blue-500/30 flex items-center justify-center gap-2 group whitespace-nowrap flex-shrink-0"
                        onClick={handleAdd}
                    >
                        <Plus className="h-3.5 w-3.5 group-hover:rotate-90 transition-transform duration-500" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">Add</span>
                    </Button>
                </div>
            </div>

            {/* Skills Matrix */}
            <div className="bg-white rounded-[3rem] overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.02)] border border-slate-100">
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-100 hover:bg-transparent">
                            <TableHead className="py-7 pl-12 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Signature</TableHead>
                            <TableHead className="py-7 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Knowledge Domain</TableHead>
                            <TableHead className="py-7 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Integration Date</TableHead>
                            <TableHead className="py-7 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Deployment</TableHead>
                            <TableHead className="py-7 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-right pr-12">Control</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredSkills.map((skill) => (
                            <TableRow key={skill.id} className="group/row hover:bg-slate-50/80 transition-all duration-500 border-slate-50">
                                <TableCell className="py-6 pl-12">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl group-hover/row:scale-110 transition-transform duration-500 border border-slate-800">
                                            {getCategoryIcon(skill.category)}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-slate-800 uppercase tracking-tight group-hover/row:text-blue-600 transition-colors">
                                                {skill.name}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{skill.slug}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="py-6">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{skill.category || "General"}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-6">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        {new Date(skill.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </TableCell>
                                <TableCell className="py-6">
                                    <div className="flex items-center gap-4">
                                        <Switch
                                            checked={skill.isActive}
                                            onCheckedChange={() => handleToggleActive(skill.id, skill.isActive)}
                                            className="scale-90 data-[state=checked]:bg-blue-600"
                                        />
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-widest",
                                            skill.isActive ? "text-blue-600" : "text-slate-400"
                                        )}>
                                            {skill.isActive ? "Active" : "Archived"}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-6 pr-12 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-40 group-hover/row:opacity-100 transition-all duration-500">
                                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl bg-white shadow-sm hover:bg-slate-900 hover:text-white transition-all border border-slate-100" onClick={() => handleEdit(skill)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl bg-white shadow-sm hover:bg-red-600 hover:text-white transition-all border border-slate-100" onClick={() => handleDelete(skill.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {filteredSkills.length === 0 && (
                    <div className="p-20 text-center animate-in zoom-in-95 duration-700">
                        <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
                            <Brain className="h-10 w-10 text-slate-300" />
                        </div>
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em] mb-2">No Intelligence Found</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">The skill matrix for this domain is currently vacant.</p>
                    </div>
                )}
            </div>

            {showForm && (
                <SkillForm
                    skill={editingSkill}
                    onClose={() => setShowForm(false)}
                    onSuccess={handleFormSuccess}
                />
            )}
        </div>
    )
}
