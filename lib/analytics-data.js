// Illustrative data for the analytics interface. Replace with a verified data source in production.
export const socialMentions = [
    { id: 1, platform: "Twitter", user: "@delhi_traffic_help", content: "Heavy waterlogging reported near Minto Road. Drivers should use alternate routes. #DelhiTraffic #Waterlogging", timestamp: "2 min ago", sentiment: "warning", engagement: 145, verified: true },
    { id: 2, platform: "Instagram", user: "pune_city_updates", content: "A fallen tree is blocking part of Baner Road after strong winds. Municipal workers have been informed.", timestamp: "15 min ago", sentiment: "neutral", engagement: 98, verified: false },
    { id: 3, platform: "Facebook", user: "Guwahati Community Network", content: "Floodwater is rising near the market area. Please avoid the low-lying road and follow district advisories.", timestamp: "1 hour ago", sentiment: "warning", engagement: 189, verified: true },
    { id: 4, platform: "Twitter", user: "@himalayan_routes", content: "Landslide debris reported on a hill road in Uttarakhand. Traffic is moving slowly through one lane.", timestamp: "2 hours ago", sentiment: "negative", engagement: 203, verified: true },
    { id: 5, platform: "Instagram", user: "bengaluru_neighbourhood", content: "Exposed electrical wires spotted beside a damaged footpath. The area has been marked for safety.", timestamp: "3 hours ago", sentiment: "warning", engagement: 247, verified: false },
];

export const trendingData = [
    { time: "00:00", mentions: 12, alerts: 2 }, { time: "04:00", mentions: 8, alerts: 1 },
    { time: "08:00", mentions: 25, alerts: 4 }, { time: "12:00", mentions: 45, alerts: 8 },
    { time: "16:00", mentions: 67, alerts: 12 }, { time: "20:00", mentions: 38, alerts: 6 },
];

export const sentimentData = [
    { name: "Positive", value: 20, color: "#22c55e" }, { name: "Neutral", value: 35, color: "#64748b" },
    { name: "Warning", value: 35, color: "#f59e0b" }, { name: "Negative", value: 10, color: "#ef4444" },
];

export const platformData = [
    { platform: "Twitter", mentions: 145, growth: 12 }, { platform: "Instagram", mentions: 89, growth: -5 },
    { platform: "Facebook", mentions: 67, growth: 8 }, { platform: "TikTok", mentions: 124, growth: 15 },
    { platform: "Reddit", mentions: 45, growth: 3 },
];

export const trendingHashtags = [
    { tag: "#IndiaSafety", count: 1247, trend: "up" }, { tag: "#RoadSafety", count: 892, trend: "up" },
    { tag: "#FloodAlert", count: 567, trend: "up" }, { tag: "#WeatherAlert", count: 445, trend: "stable" },
    { tag: "#CommunityReport", count: 334, trend: "up" },
];
