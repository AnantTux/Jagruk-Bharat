import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, Anchor, Phone, Shield, Waves, Wind } from "lucide-react"
import { INDIAN_EMERGENCY } from "@/lib/emergency"

const items = [
  {
    icon: Waves,
    iconClass: "text-amber-400",
    bgClass: "bg-amber-400/20",
    title: "Rip currents",
    body: "If caught in a rip, swim parallel to the shore until out of the current, then angle back to land. Do not swim against the flow.",
  },
  {
    icon: Wind,
    iconClass: "text-sky-400",
    bgClass: "bg-sky-400/20",
    title: "Cyclone & squall watch",
    body: "Monitor IMD coastal bulletins. Secure boats, avoid piers during high wind, and move inland when district authorities issue orange or red alerts.",
  },
  {
    icon: Anchor,
    iconClass: "text-blue-400",
    bgClass: "bg-blue-400/20",
    title: "Before entering the water",
    body: "Check local tide tables, lifeguard flags, and recent map reports. Never swim alone at dusk or on unpatrolled beaches.",
  },
  {
    icon: AlertTriangle,
    iconClass: "text-red-400",
    bgClass: "bg-red-400/20",
    title: "Reporting hazards",
    body: "Pin the exact location on the map, add photos when safe, and upvote or downvote alerts so responders can trust community signals.",
  },
  {
    icon: Shield,
    iconClass: "text-emerald-400",
    bgClass: "bg-emerald-400/20",
    title: "Tsunami awareness",
    body: "After strong coastal shaking, move to high ground immediately. Do not wait for an official warning if the sea withdraws unusually far.",
  },
  {
    icon: Phone,
    iconClass: "text-blue-400",
    bgClass: "bg-blue-400/20",
    title: "India emergency numbers",
    body: `${INDIAN_EMERGENCY.national.number} (national) · ${INDIAN_EMERGENCY.police.number} police · ${INDIAN_EMERGENCY.ambulance.number} ambulance · ${INDIAN_EMERGENCY.coastGuard.number} Coast Guard · ${INDIAN_EMERGENCY.fire.number} fire`,
  },
]

export function SafetyBriefing() {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white uppercase tracking-widest border-l-4 border-amber-400 pl-4">
        Safety Briefing
      </h3>
      {items.map((item) => {
        const Icon = item.icon
        return (
          <Card key={item.title} className="bg-slate-800 border-slate-700 rounded-2xl overflow-hidden">
            <CardContent className="p-5">
              <div className="flex gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${item.bgClass}`}
                >
                  <Icon className={`w-5 h-5 ${item.iconClass}`} />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">{item.title}</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.body}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

