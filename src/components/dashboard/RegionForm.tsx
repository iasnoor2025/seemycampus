"use client"

import { useState, useEffect } from "react"
import { Plus, MapPin, Loader2, Save, X, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface Region {
    id: number
    name: string
    slug: string
    type: string
    parentId?: number
    imageUrl?: string
    description?: string
    isActive: boolean
}

interface RegionFormProps {
    region?: Region
    onClose: () => void
    onSuccess: () => void
}

export default function RegionForm({ region, onClose, onSuccess }: RegionFormProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [parentRegions, setParentRegions] = useState<Region[]>([])
    const [formData, setFormData] = useState({
        name: region?.name || "",
        slug: region?.slug || "",
        type: region?.type || "country",
        parentId: region?.parentId ? region.parentId.toString() : "none",
        imageUrl: region?.imageUrl || "",
        description: region?.description || "",
        isActive: region ? region.isActive : true,
    })

    useEffect(() => {
        const fetchPotentialParents = async () => {
            try {
                const response = await fetch("/api/dashboard/regions?all=true")
                const data = await response.json()
                // Filter out the current region to prevent self-referencing
                setParentRegions(data.regions.filter((r: Region) => r.id !== region?.id))
            } catch (err) {
                console.error("Error fetching parent regions:", err)
            }
        }
        fetchPotentialParents()
    }, [region])

    const handleNameChange = (name: string) => {
        const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
        setFormData({ ...formData, name, slug })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const url = region ? `/api/dashboard/regions/${region.id}` : "/api/dashboard/regions"
            const method = region ? "PATCH" : "POST"

            const dataToSubmit = {
                ...formData,
                parentId: formData.parentId === "none" ? null : parseInt(formData.parentId)
            }

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dataToSubmit),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || "Something went wrong")
            }

            onSuccess()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.1)] border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-500">
                {/* Header */}
                <div className="px-10 py-8 border-b border-slate-100/50 flex items-center justify-between bg-slate-50/30">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg">
                            <MapPin className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
                                {region ? "Modify Territory" : "Annex Territory"}
                            </h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                Geospatial Asset Configuration
                            </p>
                        </div>
                    </div>
                    <Button variant="ghost" onClick={onClose} className="h-10 w-10 rounded-full hover:bg-slate-100 text-slate-400">
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 space-y-12 scrollbar-hide">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            {error}
                        </div>
                    )}

                    <form id="region-form" onSubmit={handleSubmit} className="space-y-10">
                        {/* Core Identity */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-0.5 w-8 bg-indigo-600 rounded-full" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-800">Geospatial Identity</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Territory Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => handleNameChange(e.target.value)}
                                        required
                                        className="h-12 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/10"
                                        placeholder="e.g. Maharashtra"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="slug" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Geocode Slug</Label>
                                    <Input
                                        id="slug"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        required
                                        className="h-12 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/10"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Territory Tier</Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(value) => setFormData({ ...formData, type: value })}
                                    >
                                        <SelectTrigger className="h-12 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-700">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="country" className="text-xs font-bold uppercase tracking-widest">Nation State</SelectItem>
                                            <SelectItem value="state" className="text-xs font-bold uppercase tracking-widest">Province / State</SelectItem>
                                            <SelectItem value="city" className="text-xs font-bold uppercase tracking-widest">Metropolitan Hub</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Parent Jurisdiction</Label>
                                    <Select
                                        value={formData.parentId}
                                        onValueChange={(value) => setFormData({ ...formData, parentId: value })}
                                    >
                                        <SelectTrigger className="h-12 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-700">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none" className="text-xs font-bold uppercase tracking-widest">Global Sovereign</SelectItem>
                                            {parentRegions.map((r) => (
                                                <SelectItem key={r.id} value={r.id.toString()} className="text-xs font-bold uppercase tracking-widest">
                                                    {r.name} ({r.type})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="imageUrl" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Hero Asset (Image URL)</Label>
                                <Input
                                    id="imageUrl"
                                    value={formData.imageUrl}
                                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                    className="h-12 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/10"
                                    placeholder="https://assets.seemycampus.com/regions/..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Regional Intelligence</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="bg-slate-50 border-none rounded-3xl p-6 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/10 min-h-[120px]"
                                    placeholder="Describe the regional characteristics and strategic importance..."
                                />
                            </div>
                        </section>
                    </form>
                </div>

                {/* Footer */}
                <div className="px-10 py-8 border-t border-slate-100 flex items-center justify-end gap-4 bg-slate-50/30">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        className="h-12 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-200 transition-all"
                    >
                        Discard
                    </Button>
                    <Button
                        type="submit"
                        form="region-form"
                        disabled={loading}
                        className="h-12 px-10 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl shadow-xl hover:shadow-indigo-500/30 transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-3"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        {region ? "Update Geospatial Data" : "Save Territorial Data"}
                    </Button>
                </div>
            </div>
        </div>
    )
}
