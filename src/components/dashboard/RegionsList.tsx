"use client"

import { useState, useEffect } from "react"
import {
    Plus,
    Search,
    Edit,
    Trash2,
    MapPin,
    Globe,
    Navigation,
    Loader2,
    Mountain,
    Map
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
import { cn } from "@/lib/utils"
import RegionForm from "./RegionForm"

interface Region {
    id: number
    name: string
    slug: string
    type: string
    parentId?: number
    imageUrl?: string
    isActive: boolean
    createdAt: string
}

export default function RegionsList() {
    const [regions, setRegions] = useState<Region[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [typeFilter, setTypeFilter] = useState("all")
    const [showForm, setShowForm] = useState(false)
    const [editingRegion, setEditingRegion] = useState<Region | undefined>(undefined)

    const fetchRegions = async () => {
        try {
            setLoading(true)
            const response = await fetch("/api/dashboard/regions?all=true")
            const data = await response.json()
            setRegions(data.regions || [])
        } catch (error) {
            console.error("Error fetching regions:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRegions()
    }, [])

    const filteredRegions = regions.filter(region => {
        const matchesSearch = region.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            region.slug.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesType = typeFilter === "all" || region.type === typeFilter
        return matchesSearch && matchesType
    })

    const handleAdd = () => {
        setEditingRegion(undefined)
        setShowForm(true)
    }

    const handleEdit = (region: Region) => {
        setEditingRegion(region)
        setShowForm(true)
    }

    const handleFormSuccess = () => {
        setShowForm(false)
        fetchRegions()
    }

    const handleToggleActive = async (id: number, currentStatus: boolean) => {
        try {
            const response = await fetch(`/api/dashboard/regions/${id}`, {
                method: "PATCH",
                body: JSON.stringify({ isActive: !currentStatus }),
            })
            if (response.ok) {
                setRegions(regions.map(r => r.id === id ? { ...r, isActive: !currentStatus } : r))
            }
        } catch (error) {
            console.error("Error toggling region status:", error)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to remove this territory?")) return
        try {
            const response = await fetch(`/api/dashboard/regions/${id}`, {
                method: "DELETE",
            })
            if (response.ok) {
                setRegions(regions.filter(r => r.id !== id))
            }
        } catch (error) {
            console.error("Error deleting region:", error)
        }
    }

    const getTypeIcon = (type: string) => {
        switch (type?.toLowerCase()) {
            case "country": return <Globe className="h-4 w-4" />
            case "state": return <Map className="h-4 w-4" />
            case "city": return <Navigation className="h-4 w-4" />
            default: return <MapPin className="h-4 w-4" />
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Mapping Territories</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Territory Intelligence - Single Row */}
            <div className="bg-white p-3 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.04)] border border-slate-100/50">
                <div className="flex flex-row items-center gap-3 flex-nowrap">
                    {/* Search - Flexible */}
                    <div className="relative flex-1 min-w-0 group">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-3 py-3 bg-slate-50 border-none rounded-[1.5rem] focus:ring-2 focus:ring-indigo-500/20 text-[11px] font-bold uppercase tracking-wider text-slate-700 placeholder:text-slate-400 transition-all"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center border border-slate-100">
                            <MapPin className="h-3 w-3 text-slate-400" />
                        </div>
                    </div>

                    {/* Scope Filter */}
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="h-12 w-[160px] bg-slate-50 border-none rounded-[1.5rem] text-[9px] font-black uppercase tracking-widest px-3 hover:bg-slate-100 transition-all flex-shrink-0">
                            <SelectValue placeholder="Scope" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                            <SelectItem value="all" className="text-[10px] font-bold uppercase tracking-widest">All Scopes</SelectItem>
                            <SelectItem value="country" className="text-[10px] font-bold uppercase tracking-widest">Nations</SelectItem>
                            <SelectItem value="state" className="text-[10px] font-bold uppercase tracking-widest">States</SelectItem>
                            <SelectItem value="city" className="text-[10px] font-bold uppercase tracking-widest">Cities</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Add Button */}
                    <Button
                        className="h-12 px-5 bg-slate-900 hover:bg-indigo-600 text-white rounded-[1.5rem] transition-all duration-500 shadow-xl hover:shadow-indigo-500/40 flex items-center justify-center gap-2 group whitespace-nowrap flex-shrink-0"
                        onClick={handleAdd}
                    >
                        <Plus className="h-3.5 w-3.5 group-hover:rotate-90 transition-transform duration-500" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">Add</span>
                    </Button>
                </div>
            </div>

            {/* Geospatial Matrix */}
            <div className="bg-white rounded-[3rem] overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.02)] border border-slate-100">
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-100 hover:bg-transparent">
                            <TableHead className="py-7 pl-12 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Geographic Signature</TableHead>
                            <TableHead className="py-7 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Territory Scope</TableHead>
                            <TableHead className="py-7 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Deployment</TableHead>
                            <TableHead className="py-7 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-right pr-12">Control</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredRegions.map((region) => (
                            <TableRow key={region.id} className="group/row hover:bg-slate-50/80 transition-all duration-500 border-slate-50">
                                <TableCell className="py-6 pl-12">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl group-hover/row:scale-110 transition-transform duration-500 border border-slate-800 overflow-hidden relative">
                                            {region.imageUrl ? (
                                                <img src={region.imageUrl} className="w-full h-full object-cover opacity-60" alt="" />
                                            ) : (
                                                getTypeIcon(region.type)
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-slate-800 uppercase tracking-tight group-hover/row:text-indigo-600 transition-colors">
                                                {region.name}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{region.slug}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="py-6">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{region.type || "Undefined"}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-6">
                                    <div className="flex items-center gap-4">
                                        <Switch
                                            checked={region.isActive}
                                            onCheckedChange={() => handleToggleActive(region.id, region.isActive)}
                                            className="scale-90 data-[state=checked]:bg-indigo-600"
                                        />
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-widest",
                                            region.isActive ? "text-indigo-600" : "text-slate-400"
                                        )}>
                                            {region.isActive ? "Published" : "Draft"}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-6 pr-12 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-40 group-hover/row:opacity-100 transition-all duration-500">
                                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl bg-white shadow-sm hover:bg-slate-900 hover:text-white transition-all border border-slate-100" onClick={() => handleEdit(region)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl bg-white shadow-sm hover:bg-red-600 hover:text-white transition-all border border-slate-100" onClick={() => handleDelete(region.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {filteredRegions.length === 0 && (
                    <div className="p-20 text-center animate-in zoom-in-95 duration-700">
                        <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
                            <Globe className="h-10 w-10 text-slate-300" />
                        </div>
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em] mb-2">No Territories Mapped</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">The geospatial matrix is currently blank.</p>
                    </div>
                )}
            </div>

            {showForm && (
                <RegionForm
                    region={editingRegion}
                    onClose={() => setShowForm(false)}
                    onSuccess={handleFormSuccess}
                />
            )}
        </div>
    )
}
