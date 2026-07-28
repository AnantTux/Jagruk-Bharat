import { AlertTriangle, Fish, Thermometer, Waves, Wind, Zap } from "lucide-react";
export const reportHazardTypes = [
    { id: "rip-current", name: "Rip Current", icon: Waves, description: "Strong water current pulling away from shore", color: "bg-destructive" },
    { id: "jellyfish", name: "Jellyfish Bloom", icon: Zap, description: "Large concentration of jellyfish", color: "bg-chart-3" },
    { id: "debris", name: "Floating Debris", icon: AlertTriangle, description: "Dangerous objects in the water", color: "bg-muted-foreground" },
    { id: "marine-life", name: "Marine Life Alert", icon: Fish, description: "Sharks, aggressive marine animals", color: "bg-primary" },
    { id: "pollution", name: "Water Pollution", icon: Wind, description: "Oil spills, chemical contamination", color: "bg-accent" },
    { id: "weather", name: "Weather Hazard", icon: Thermometer, description: "Sudden weather changes, storms", color: "bg-secondary" },
];
export const severityLevels = [
    { id: "low", name: "Low Risk", description: "Minor concern, exercise normal caution", color: "bg-primary" },
    { id: "medium", name: "Medium Risk", description: "Moderate danger, increased caution advised", color: "bg-chart-3" },
    { id: "high", name: "High Risk", description: "Immediate danger, avoid area", color: "bg-destructive" },
];
export const dashboardHazardTypes = [
    { id: "rip-current", name: "Rip Currents", icon: Waves, color: "bg-destructive" },
    { id: "jellyfish", name: "Jellyfish", icon: Zap, color: "bg-chart-3" },
    { id: "debris", name: "Debris", icon: AlertTriangle, color: "bg-muted-foreground" },
    { id: "shark", name: "Marine Life", icon: Fish, color: "bg-primary" },
    { id: "pollution", name: "Pollution", icon: Wind, color: "bg-accent" },
];
