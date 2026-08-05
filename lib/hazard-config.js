import { AlertTriangle, Car, CloudLightning, CloudRain, Construction, Flame, Mountain, Trash2, TreePine, Zap } from "lucide-react";
export const reportHazardTypes = [
    { id: "road-accident", name: "Road Accident", icon: Car, description: "Vehicle crashes or dangerous traffic incidents", color: "bg-destructive" },
    { id: "fire", name: "Fire or Smoke", icon: Flame, description: "Building, vehicle, forest, or open-area fires", color: "bg-orange-500" },
    { id: "flooding", name: "Flooding", icon: CloudRain, description: "Floodwater, waterlogging, or overflowing drains", color: "bg-blue-500" },
    { id: "landslide", name: "Landslide", icon: Mountain, description: "Falling rocks, slope failure, or blocked hill roads", color: "bg-amber-700" },
    { id: "blocked-route", name: "Blocked Route", icon: TreePine, description: "Fallen trees, debris, or other route obstructions", color: "bg-emerald-600" },
    { id: "infrastructure", name: "Unsafe Infrastructure", icon: Construction, description: "Damaged roads, bridges, buildings, or public structures", color: "bg-yellow-500" },
    { id: "electrical", name: "Electrical Hazard", icon: Zap, description: "Exposed wires, fallen poles, or electrical fire risk", color: "bg-violet-500" },
    { id: "pollution", name: "Pollution or Waste", icon: Trash2, description: "Hazardous waste, spills, smoke, or contaminated areas", color: "bg-slate-500" },
    { id: "severe-weather", name: "Severe Weather", icon: CloudLightning, description: "Storms, lightning, extreme rain, heat, or strong winds", color: "bg-cyan-600" },
    { id: "other", name: "Other Public Hazard", icon: AlertTriangle, description: "Another immediate risk to people or public spaces", color: "bg-red-600" },
];
export const severityLevels = [
    { id: "low", name: "Low Risk", description: "Minor concern, exercise normal caution", color: "bg-primary" },
    { id: "medium", name: "Medium Risk", description: "Moderate danger, increased caution advised", color: "bg-chart-3" },
    { id: "high", name: "High Risk", description: "Immediate danger, avoid area", color: "bg-destructive" },
];
export const dashboardHazardTypes = reportHazardTypes.map(({ id, name, icon, color }) => ({ id, name, icon, color }));
export const HAZARD_TYPE_IDS = new Set(reportHazardTypes.map(({ id }) => id));
