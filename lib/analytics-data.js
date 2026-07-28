export const socialMentions = [
    { id: 1, platform: "Twitter", user: "@beachsafety_ca", content: "Strong rip currents reported at Malibu Beach. Lifeguards advising swimmers to stay close to shore. #OceanSafety #RipCurrent", timestamp: "2 min ago", sentiment: "warning", engagement: 45, verified: true },
    { id: 2, platform: "Instagram", user: "surfer_mike92", content: "Massive jellyfish bloom spotted near Santa Monica Pier! Be careful out there 🌊", timestamp: "15 min ago", sentiment: "neutral", engagement: 128, verified: false },
    { id: 3, platform: "Facebook", user: "Marina Del Rey Community", content: "Oil spill cleanup crews working overnight. Beach access restricted until further notice.", timestamp: "1 hour ago", sentiment: "negative", engagement: 89, verified: true },
    { id: 4, platform: "Twitter", user: "@coastguard_west", content: "Weather advisory: High winds and rough seas expected. Small craft advisory in effect.", timestamp: "2 hours ago", sentiment: "warning", engagement: 203, verified: true },
    { id: 5, platform: "TikTok", user: "ocean_explorer", content: "Shark sighting at Huntington Beach - everyone stayed calm and safe! 🦈", timestamp: "3 hours ago", sentiment: "positive", engagement: 1247, verified: false },
];
export const trendingData = [
    { time: "00:00", mentions: 12, alerts: 2 }, { time: "04:00", mentions: 8, alerts: 1 },
    { time: "08:00", mentions: 25, alerts: 4 }, { time: "12:00", mentions: 45, alerts: 8 },
    { time: "16:00", mentions: 67, alerts: 12 }, { time: "20:00", mentions: 38, alerts: 6 },
];
export const sentimentData = [
    { name: "Positive", value: 35, color: "#22c55e" }, { name: "Neutral", value: 45, color: "#64748b" },
    { name: "Warning", value: 15, color: "#f59e0b" }, { name: "Negative", value: 5, color: "#ef4444" },
];
export const platformData = [
    { platform: "Twitter", mentions: 145, growth: 12 }, { platform: "Instagram", mentions: 89, growth: -5 },
    { platform: "Facebook", mentions: 67, growth: 8 }, { platform: "TikTok", mentions: 234, growth: 25 },
    { platform: "Reddit", mentions: 45, growth: 3 },
];
export const trendingHashtags = [
    { tag: "#OceanSafety", count: 1247, trend: "up" }, { tag: "#RipCurrent", count: 892, trend: "up" },
    { tag: "#BeachAlert", count: 567, trend: "down" }, { tag: "#MarineLife", count: 445, trend: "up" },
    { tag: "#CoastGuard", count: 334, trend: "stable" },
];
