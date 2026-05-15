"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Hash,
  Filter,
  RefreshCw,
  Download,
  Share2,
  Heart,
  Repeat2,
  Eye,
  Waves,
  Search,
} from "lucide-react"

// Mock social media data
const socialMentions = [
  {
    id: 1,
    platform: "Twitter",
    user: "@beachsafety_ca",
    content:
      "Strong rip currents reported at Malibu Beach. Lifeguards advising swimmers to stay close to shore. #OceanSafety #RipCurrent",
    timestamp: "2 min ago",
    sentiment: "warning",
    engagement: 45,
    verified: true,
  },
  {
    id: 2,
    platform: "Instagram",
    user: "surfer_mike92",
    content: "Massive jellyfish bloom spotted near Santa Monica Pier! Be careful out there 🌊",
    timestamp: "15 min ago",
    sentiment: "neutral",
    engagement: 128,
    verified: false,
  },
  {
    id: 3,
    platform: "Facebook",
    user: "Marina Del Rey Community",
    content: "Oil spill cleanup crews working overnight. Beach access restricted until further notice.",
    timestamp: "1 hour ago",
    sentiment: "negative",
    engagement: 89,
    verified: true,
  },
  {
    id: 4,
    platform: "Twitter",
    user: "@coastguard_west",
    content: "Weather advisory: High winds and rough seas expected. Small craft advisory in effect.",
    timestamp: "2 hours ago",
    sentiment: "warning",
    engagement: 203,
    verified: true,
  },
  {
    id: 5,
    platform: "TikTok",
    user: "ocean_explorer",
    content: "Shark sighting at Huntington Beach - everyone stayed calm and safe! 🦈",
    timestamp: "3 hours ago",
    sentiment: "positive",
    engagement: 1247,
    verified: false,
  },
]

const trendingData = [
  { time: "00:00", mentions: 12, alerts: 2 },
  { time: "04:00", mentions: 8, alerts: 1 },
  { time: "08:00", mentions: 25, alerts: 4 },
  { time: "12:00", mentions: 45, alerts: 8 },
  { time: "16:00", mentions: 67, alerts: 12 },
  { time: "20:00", mentions: 38, alerts: 6 },
]

const sentimentData = [
  { name: "Positive", value: 35, color: "#22c55e" },
  { name: "Neutral", value: 45, color: "#64748b" },
  { name: "Warning", value: 15, color: "#f59e0b" },
  { name: "Negative", value: 5, color: "#ef4444" },
]

const platformData = [
  { platform: "Twitter", mentions: 145, growth: 12 },
  { platform: "Instagram", mentions: 89, growth: -5 },
  { platform: "Facebook", mentions: 67, growth: 8 },
  { platform: "TikTok", mentions: 234, growth: 25 },
  { platform: "Reddit", mentions: 45, growth: 3 },
]

const trendingHashtags = [
  { tag: "#OceanSafety", count: 1247, trend: "up" },
  { tag: "#RipCurrent", count: 892, trend: "up" },
  { tag: "#BeachAlert", count: 567, trend: "down" },
  { tag: "#MarineLife", count: 445, trend: "up" },
  { tag: "#CoastGuard", count: 334, trend: "stable" },
]

export default function SocialAnalyticsDashboard() {
  const [selectedPlatform, setSelectedPlatform] = useState("all")
  const [timeRange, setTimeRange] = useState("24h")
  const [sentimentFilter, setSentimentFilter] = useState("all")

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "text-green-400"
      case "warning":
        return "text-yellow-400"
      case "negative":
        return "text-red-400"
      default:
        return "text-slate-400"
    }
  }

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-500 text-white"
      case "warning":
        return "bg-yellow-500 text-black"
      case "negative":
        return "bg-red-500 text-white"
      default:
        return "bg-slate-600 text-white"
    }
  }

  const getPlatformIcon = (platform: string) => {
    // Return appropriate platform icon based on platform name
    return MessageSquare
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-amber-400 rounded-lg">
                <Waves className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">AnantTatt Analytics</h1>
                <p className="text-sm text-slate-300">AnantTatt · Coastal signal monitoring</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-slate-700">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium text-white">Platform:</Label>
            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger className="w-32 bg-slate-800 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="twitter">Twitter</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium text-white">Time Range:</Label>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-24 bg-slate-800 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="1h">1 Hour</SelectItem>
                <SelectItem value="24h">24 Hours</SelectItem>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium text-white">Sentiment:</Label>
            <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
              <SelectTrigger className="w-32 bg-slate-800 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="all">All Sentiment</SelectItem>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1" />

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search mentions..."
              className="pl-10 w-64 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-slate-800 border border-slate-700 rounded-lg">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-300">Total Mentions</p>
                  <p className="text-2xl font-bold text-white">2,847</p>
                </div>
                <div className="flex items-center gap-1 text-green-400">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">+12%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-300">Active Alerts</p>
                  <p className="text-2xl font-bold text-red-400">23</p>
                </div>
                <div className="flex items-center gap-1 text-red-400">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">+8%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-300">Engagement Rate</p>
                  <p className="text-2xl font-bold text-white">4.2%</p>
                </div>
                <div className="flex items-center gap-1 text-green-400">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">+0.3%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-300">Response Time</p>
                  <p className="text-2xl font-bold text-white">4.5m</p>
                </div>
                <div className="flex items-center gap-1 text-green-400">
                  <TrendingDown className="w-4 h-4" />
                  <span className="text-sm font-medium">-1.2m</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-lg">
              <div className="p-6 border-b border-slate-700">
                <h3 className="text-lg font-semibold text-white">Mentions Timeline</h3>
                <p className="text-sm text-slate-300">Social media mentions and alerts over time</p>
              </div>
              <div className="p-6">
                <ChartContainer
                  config={{
                    mentions: {
                      label: "Mentions",
                      color: "#fbbf24",
                    },
                    alerts: {
                      label: "Alerts",
                      color: "#f59e0b",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendingData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                      <XAxis dataKey="time" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="mentions"
                        stackId="1"
                        stroke="var(--color-mentions)"
                        fill="var(--color-mentions)"
                        fillOpacity={0.6}
                      />
                      <Area
                        type="monotone"
                        dataKey="alerts"
                        stackId="1"
                        stroke="var(--color-alerts)"
                        fill="var(--color-alerts)"
                        fillOpacity={0.8}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-lg">
              <div className="p-6 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Recent Mentions</h3>
                    <p className="text-sm text-slate-300">Latest social media posts about ocean hazards</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {socialMentions.map((mention) => {
                  const PlatformIcon = getPlatformIcon(mention.platform)
                  return (
                    <div
                      key={mention.id}
                      className="border border-slate-600 rounded-lg p-4 hover:bg-slate-700/50 transition-colors bg-slate-700/30"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <PlatformIcon className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-medium text-white">{mention.user}</span>
                            {mention.verified && <Badge className="text-xs bg-amber-400 text-black">Verified</Badge>}
                          </div>
                          <Badge className={`text-xs ${getSentimentBadge(mention.sentiment)}`}>
                            {mention.sentiment}
                          </Badge>
                        </div>
                        <span className="text-xs text-slate-400">{mention.timestamp}</span>
                      </div>

                      <p className="text-sm text-slate-200 mb-3 leading-relaxed">{mention.content}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            <span>{mention.engagement}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Repeat2 className="w-3 h-3" />
                            <span>{Math.floor(mention.engagement * 0.3)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>{mention.engagement * 10}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:text-white hover:bg-slate-600"
                          >
                            <Share2 className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:text-white hover:bg-slate-600"
                          >
                            <AlertTriangle className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-lg">
              <div className="p-6 border-b border-slate-700">
                <h3 className="text-lg font-semibold text-white">Sentiment Analysis</h3>
                <p className="text-sm text-slate-300">Distribution of mention sentiment</p>
              </div>
              <div className="p-6">
                <ChartContainer
                  config={{
                    positive: { label: "Positive", color: "#22c55e" },
                    neutral: { label: "Neutral", color: "#64748b" },
                    warning: { label: "Warning", color: "#f59e0b" },
                    negative: { label: "Negative", color: "#ef4444" },
                  }}
                  className="h-[200px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sentimentData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {sentimentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {sentimentData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-slate-300">{item.name}</span>
                      <span className="text-xs font-medium text-white">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-lg">
              <div className="p-6 border-b border-slate-700">
                <h3 className="text-lg font-semibold text-white">Platform Activity</h3>
                <p className="text-sm text-slate-300">Mentions by social platform</p>
              </div>
              <div className="p-6 space-y-3">
                {platformData.map((platform) => (
                  <div key={platform.platform} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium text-white">{platform.platform}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{platform.mentions}</span>
                      <div
                        className={`flex items-center gap-1 text-xs ${platform.growth > 0 ? "text-green-400" : platform.growth < 0 ? "text-red-400" : "text-slate-400"}`}
                      >
                        {platform.growth > 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : platform.growth < 0 ? (
                          <TrendingDown className="w-3 h-3" />
                        ) : null}
                        <span>
                          {platform.growth > 0 ? "+" : ""}
                          {platform.growth}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-lg">
              <div className="p-6 border-b border-slate-700">
                <h3 className="text-lg font-semibold text-white">Trending Hashtags</h3>
                <p className="text-sm text-slate-300">Popular ocean safety hashtags</p>
              </div>
              <div className="p-6 space-y-3">
                {trendingHashtags.map((hashtag) => (
                  <div key={hashtag.tag} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Hash className="w-4 h-4 text-amber-400" />
                      <span className="text-sm font-medium text-amber-400">{hashtag.tag}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{hashtag.count}</span>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          hashtag.trend === "up"
                            ? "bg-green-400"
                            : hashtag.trend === "down"
                              ? "bg-red-400"
                              : "bg-slate-400"
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
