import { useMemo, useState, useEffect } from "react"
import { MapPin, Search, X, Clock, Bookmark, BookmarkCheck, ExternalLink } from "lucide-react"
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import OpportunityModal from "@/components/OpportunityModal"
import { useAuth } from "@/contexts/AuthContext"
import { getOpportunities } from "@/services/opportunities"
import { calculateMatch, getScoreColor } from "@/lib/matching"
import { saveOpportunity, unsaveOpportunity, isSaved } from "@/services/applications"
import type { Opportunity, OppCategory } from "@/types/database"

const CATEGORY_CONFIG: Record<OppCategory | "all", { label: string; color: string; icon: string }> = {
  all: { label: "Todas", color: "#0B2A4A", icon: "📍" },
  curso: { label: "Cursos", color: "#10B981", icon: "📚" },
  emprego: { label: "Empregos", color: "#3B82F6", icon: "💼" },
  bolsa: { label: "Bolsas", color: "#8B5CF6", icon: "🎓" },
  voluntariado: { label: "Voluntariado", color: "#F59E0B", icon: "💙" },
  programa: { label: "Programas", color: "#EF4444", icon: "🤝" },
}

const REGIONS = [
  { name: "Niterói", center: [-22.8832, -43.1034] as [number, number], zoom: 12 },
  { name: "São Gonçalo", center: [-22.8268, -43.0634] as [number, number], zoom: 12 },
  { name: "Niterói + São Gonçalo", center: [-22.855, -43.083] as [number, number], zoom: 11 },
  { name: "Rio de Janeiro", center: [-22.9068, -43.1729] as [number, number], zoom: 11 },
  { name: "Baixada Fluminense", center: [-22.7592, -43.4511] as [number, number], zoom: 10 },
  { name: "Região Serrana", center: [-22.5050, -43.1786] as [number, number], zoom: 10 },
  { name: "Sul Fluminense", center: [-22.5231, -44.1042] as [number, number], zoom: 10 },
]

const OPPORTUNITY_COORDS: Record<string, [number, number]> = {
  "aaaaaaaa-aaaa-aaaa-aaaa-000000000001": [-22.9068, -43.1729],   // Centro, Rio
  "aaaaaaaa-aaaa-aaaa-aaaa-000000000002": [-22.8833, -43.1036],   // Centro, Niterói
  "aaaaaaaa-aaaa-aaaa-aaaa-000000000004": [-22.9035, -43.1108],   // Icaraí, Niterói
  "aaaaaaaa-aaaa-aaaa-aaaa-000000000006": [-22.8686, -42.9828],   // Colubandê, São Gonçalo
  "aaaaaaaa-aaaa-aaaa-aaaa-000000000008": [-22.8708, -43.0992],   // Engenhoca, Niterói
  "aaaaaaaa-aaaa-aaaa-aaaa-000000000011": [-22.7592, -43.4511],   // Nova Iguaçu
  "aaaaaaaa-aaaa-aaaa-aaaa-000000000012": [-22.5050, -43.1786],   // Petrópolis
  "aaaaaaaa-aaaa-aaaa-aaaa-000000000013": [-22.99835, -43.36545], // Barra da Tijuca
  "aaaaaaaa-aaaa-aaaa-aaaa-000000000014": [-22.52306, -44.10417], // Volta Redonda
}

const LOCATION_CENTERS: Array<{ test: RegExp; coords: [number, number] }> = [
  { test: /barra da tijuca/i, coords: [-22.99835, -43.36545] },
  { test: /petr[oó]polis/i, coords: [-22.5050, -43.1786] },
  { test: /nova igua[cç]u/i, coords: [-22.7592, -43.4511] },
  { test: /volta redonda/i, coords: [-22.52306, -44.10417] },
  { test: /s[aã]o gon[cç]alo|coluband[eê]/i, coords: [-22.8686, -42.9828] },
  { test: /niter[oó]i|icara[ií]|engenhoca/i, coords: [-22.8833, -43.1036] },
  { test: /rio de janeiro/i, coords: [-22.9068, -43.1729] },
]

function getOpportunityCoords(opp: Opportunity): [number, number] | null {
  if (opp.modality === "remoto") return null
  const exact = OPPORTUNITY_COORDS[opp.id]
  if (exact) return exact
  const location = opp.location ?? opp.organizations?.location ?? ""
  return LOCATION_CENTERS.find(({ test }) => test.test(location))?.coords ?? null
}

function markerIcon(color: string, active: boolean) {
  return L.divIcon({
    className: "oec-marker-shell",
    html: `<span class="oec-marker ${active ? "is-active" : ""}" style="--pin:${color}"><span></span></span>`,
    iconSize: active ? [38, 46] : [32, 40],
    iconAnchor: active ? [19, 44] : [16, 38],
    popupAnchor: [0, -38],
  })
}

function MapFocus({ opportunity, region }: { opportunity: Opportunity | null; region: string }) {
  const map = useMap()
  useEffect(() => {
    if (opportunity) {
      const coords = getOpportunityCoords(opportunity)
      if (coords) map.flyTo(coords, 14, { duration: 0.7 })
      return
    }
    const target = REGIONS.find(r => r.name === region) ?? REGIONS[2]
    map.flyTo(target.center, target.zoom, { duration: 0.6 })
  }, [map, opportunity, region])
  return null
}

interface ListItemProps {
  opp: Opportunity
  score?: number
  userId?: string
  active: boolean
  onSelect: (opp: Opportunity) => void
}

function ListItem({ opp, score, userId, active, onSelect }: ListItemProps) {
  const [saved, setSaved] = useState(false)
  const cfg = CATEGORY_CONFIG[opp.category] ?? CATEGORY_CONFIG.all
  const scoreColor = score ? getScoreColor(score) : "#94A3B8"

  useEffect(() => { if (userId) isSaved(userId, opp.id).then(setSaved) }, [userId, opp.id])

  async function toggleSave(e: React.MouseEvent) {
    e.stopPropagation()
    if (!userId) return
    if (saved) { await unsaveOpportunity(userId, opp.id); setSaved(false) }
    else { await saveOpportunity(userId, opp.id); setSaved(true) }
  }

  const deadline = opp.deadline ? new Date(opp.deadline) : null
  const hasMapLocation = !!getOpportunityCoords(opp)

  return (
    <button type="button" className={`w-full text-left px-5 py-4 border-b transition-all ${active ? "bg-[#EAF3FA] border-l-4 border-l-[#0B2A4A] dark:bg-[#102942]" : "border-slate-100 hover:bg-slate-50/70"}`} onClick={() => onSelect(opp)}>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm flex-shrink-0" style={{ backgroundColor: cfg.color + "20" }}>{cfg.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="font-semibold text-slate-800 text-sm leading-tight line-clamp-2">{opp.title}</div>
            <span onClick={toggleSave} className={`flex-shrink-0 ${saved ? "text-brand-600" : "text-slate-300"}`}>{saved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}</span>
          </div>
          <div className="text-slate-500 text-xs mt-1">{opp.organizations?.name}</div>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`flex items-center gap-1 text-xs ${hasMapLocation ? "text-brand-600 font-medium" : "text-slate-400"}`}><MapPin size={11} />{opp.modality === "remoto" ? "Online" : (opp.location ?? "Local não informado")}</span>
            {opp.is_free && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">Gratuito</span>}
            {score != null && <span className="text-[10px] font-bold ml-auto" style={{ color: scoreColor }}>{score}% match</span>}
          </div>
          {deadline && <div className="flex items-center gap-1 mt-1.5 text-slate-400 text-xs"><Clock size={10} />Até {deadline.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</div>}
        </div>
      </div>
    </button>
  )
}

export default function MapPage() {
  const { user, profile, navigate } = useAuth()
  const [activeCategory, setActiveCategory] = useState<OppCategory | "all">("all")
  const [selectedRegion, setSelectedRegion] = useState("Niterói + São Gonçalo")
  const [freeOnly, setFreeOnly] = useState(false)
  const [search, setSearch] = useState("")
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null)
  const [detailsOpp, setDetailsOpp] = useState<Opportunity | null>(null)

  useEffect(() => {
    getOpportunities().then(({ data }) => { setOpportunities(data); setLoading(false) })
  }, [])

  const filtered = useMemo(() => opportunities.filter((opp) => {
    if (activeCategory !== "all" && opp.category !== activeCategory) return false
    if (freeOnly && !opp.is_free) return false
    if (search) {
      const q = search.toLowerCase()
      if (!opp.title.toLowerCase().includes(q) && !(opp.organizations?.name ?? "").toLowerCase().includes(q) && !(opp.location ?? "").toLowerCase().includes(q)) return false
    }
    return true
  }), [opportunities, activeCategory, freeOnly, search])

  const mappable = filtered.filter(opp => getOpportunityCoords(opp))
  const getScore = (opp: Opportunity) => profile ? calculateMatch(profile, opp).score : undefined
  const categories = Object.keys(CATEGORY_CONFIG) as Array<OppCategory | "all">
  const initialRegion = REGIONS.find(r => r.name === selectedRegion) ?? REGIONS[2]

  function selectFromList(opp: Opportunity) {
    setSelectedOpp(opp)
    const loc = (opp.location ?? "").toLowerCase()
    if (loc.includes("niter")) setSelectedRegion("Niterói")
    else if (loc.includes("gonçalo") || loc.includes("goncalo")) setSelectedRegion("São Gonçalo")
    else if (loc.includes("rio de janeiro")) setSelectedRegion("Rio de Janeiro")
  }

  return (
    <div className="min-h-screen bg-[#F4F8FC] dark:bg-[#06111F]">
      <Navbar />
      <div className="pt-16">
        <div className="bg-white border-b border-slate-100 px-4 sm:px-6 py-5">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div><h1 className="text-xl font-display font-semibold text-slate-900">Mapa de oportunidades</h1><p className="text-slate-500 text-sm mt-0.5">Clique em uma oportunidade para encontrá-la no mapa.</p></div>
              <div className="relative w-full sm:w-80"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar oportunidade ou cidade..." className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 text-sm" />{search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><X size={13} /></button>}</div>
            </div>
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {categories.map((cat) => { const cfg = CATEGORY_CONFIG[cat]; return <button key={cat} onClick={() => setActiveCategory(cat)} className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium border transition-all ${activeCategory === cat ? "text-white border-transparent" : "bg-white border-slate-200 text-slate-600"}`} style={activeCategory === cat ? { backgroundColor: cfg.color, borderColor: cfg.color } : {}}>{cfg.icon} {cfg.label}</button> })}
              <button onClick={() => setFreeOnly(v => !v)} className={`flex-shrink-0 px-3.5 py-2 rounded-xl border text-xs font-semibold ${freeOnly ? "bg-emerald-500 text-white border-emerald-500" : "bg-white border-slate-200 text-slate-600"}`}>✓ Gratuito</button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="real-map-card overflow-hidden">
                <div className="real-map-toolbar">
                  <div><div className="font-semibold text-slate-900 text-sm">{selectedOpp ? selectedOpp.title : selectedRegion}</div><div className="text-brand-600 text-xs font-medium">{mappable.length} oportunidades com localização no mapa</div></div>
                  <div className="flex gap-2 overflow-x-auto">{REGIONS.map(r => <button key={r.name} onClick={() => { setSelectedRegion(r.name); setSelectedOpp(null) }} className={`map-region-button ${selectedRegion === r.name ? "active" : ""}`}><MapPin size={11} /> {r.name}</button>)}</div>
                </div>
                <div className="professional-map-wrap">
                  <MapContainer center={initialRegion.center} zoom={initialRegion.zoom} scrollWheelZoom className="professional-map">
                    <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapFocus opportunity={selectedOpp} region={selectedRegion} />
                    {mappable.map(opp => {
                      const coords = getOpportunityCoords(opp)!
                      const cfg = CATEGORY_CONFIG[opp.category] ?? CATEGORY_CONFIG.all
                      const active = selectedOpp?.id === opp.id
                      return <Marker key={opp.id} position={coords} icon={markerIcon(cfg.color, active)} eventHandlers={{ click: () => setSelectedOpp(opp) }}><Popup><div className="oec-popup"><div className="oec-popup-kicker">{cfg.icon} {cfg.label}</div><strong>{opp.title}</strong><span>{opp.organizations?.name}</span><span className="oec-popup-location"><MapPin size={12} /> {opp.location}</span><button onClick={() => setDetailsOpp(opp)}>Ver oportunidade <ExternalLink size={12} /></button></div></Popup></Marker>
                    })}
                  </MapContainer>
                  <div className="map-data-note">Os pins usam o local informado em cada oportunidade. Quando o cadastro informa apenas cidade/UF, o mapa mostra a região aproximada da cidade.</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100"><h3 className="font-semibold text-slate-900 text-sm">Oportunidades</h3><p className="text-slate-400 text-xs mt-0.5">{loading ? "Carregando..." : `${filtered.length} resultados • clique para localizar`}</p></div>
                <div className="overflow-y-auto" style={{ maxHeight: 590 }}>
                  {loading ? <div className="p-8 flex justify-center"><div className="w-6 h-6 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" /></div> : filtered.length === 0 ? <div className="p-8 text-center text-slate-500 text-sm">Nenhuma oportunidade encontrada.</div> : filtered.map(opp => <ListItem key={opp.id} opp={opp} score={getScore(opp)} userId={user?.id} active={selectedOpp?.id === opp.id} onSelect={selectFromList} />)}
                </div>
                <div className="px-5 py-4 border-t border-slate-100"><button onClick={() => navigate("/oportunidades")} className="w-full py-2.5 rounded-xl text-sm font-semibold text-brand-600 bg-brand-50">Explorar todas as oportunidades</button></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <OpportunityModal opportunity={detailsOpp} onClose={() => setDetailsOpp(null)} />
    </div>
  )
}
