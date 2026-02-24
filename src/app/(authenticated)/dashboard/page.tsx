"use client";

import { useDashboardStats } from "@/hooks/use-data";
import {
  DollarSign,
  TrendingUp,
  ClipboardCheck,
  Users,
  Wrench,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

const PIE_COLORS = ["#1a1a1a", "#525252", "#a3a3a3", "#d4d4d4"];

export default function DashboardPage() {
  const { data, isLoading } = useDashboardStats();

  if (isLoading)
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-gray-900" />
      </div>
    );

  const stats = [
    {
      label: "Total Revenue",
      value: `XAF ${(data?.overview.totalRevenue ?? 0).toLocaleString()}`,
      icon: DollarSign,
      trend: "+12.5%",
      up: true,
    },
    {
      label: "Gross Profit",
      value: `XAF ${(data?.overview.grossProfit ?? 0).toLocaleString()}`,
      icon: TrendingUp,
      trend: "+8.2%",
      up: true,
    },
    {
      label: "Active Requests",
      value: data?.pipeline.reduce((a: number, p: any) => a + p.count, 0) ?? 0,
      icon: ClipboardCheck,
      trend: "-3",
      up: false,
    },
    {
      label: "Total Clients",
      value: data?.totalClients ?? 0,
      icon: Users,
      trend: "",
      up: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Business overview and key metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-gray-200 p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <s.icon className="w-4 h-4 text-gray-400" />
              {s.trend && (
                <span
                  className={`flex items-center gap-0.5 text-xs font-medium ${
                    s.up ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {s.up ? (
                    <ArrowUp className="w-3 h-3" />
                  ) : (
                    <ArrowDown className="w-3 h-3" />
                  )}
                  {s.trend}
                </span>
              )}
            </div>
            <p className="text-2xl font-semibold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-900">Revenue Trend</h2>
            <select className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded px-2 py-1">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.revenueTrend}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#171717" stopOpacity={0.08} />
                    <stop offset="95%" stopColor="#171717" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#9ca3af" }}
                />
                <YAxis
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#9ca3af" }}
                  tickFormatter={(v) => `${v / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 6,
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#171717"
                  strokeWidth={2}
                  fill="url(#revGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="costs"
                  stroke="#d1d5db"
                  strokeWidth={1.5}
                  fill="transparent"
                  strokeDasharray="4 4"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Machine Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 flex flex-col">
          <h2 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-gray-400" />
            Machine Status
          </h2>
          <div className="h-40 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.machines}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {data?.machines.map((_: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-auto">
            {data?.machines.map((m: any, i: number) => (
              <div
                key={i}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: PIE_COLORS[i % PIE_COLORS.length],
                    }}
                  />
                  <span className="text-gray-600 capitalize">
                    {m.status.toLowerCase().replace(/_/g, " ")}
                  </span>
                </div>
                <span className="font-medium text-gray-900">{m.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Uptime Card */}
        <div className="bg-gray-900 rounded-lg p-5 text-white">
          <p className="text-xs text-gray-400 font-medium mb-1">
            Operational Uptime
          </p>
          <p className="text-3xl font-semibold">94%</p>
          <p className="text-xs text-gray-500 mt-1">
            Across all infrastructure
          </p>
          <div className="h-16 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[1, 4, 2, 6, 3, 8, 4, 9, 2, 7].map((v) => ({ v }))}
              >
                <Bar dataKey="v" fill="#525252" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pipeline */}
        <div className="lg:col-span-3 bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="text-sm font-medium text-gray-900 mb-4">
            Request Pipeline
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {data?.pipeline.map((p: any, i: number) => {
              const total =
                data?.pipeline.reduce(
                  (a: number, b: any) => a + b.count,
                  0
                ) || 1;
              return (
                <div key={i} className="p-3 rounded-lg bg-gray-50">
                  <p className="text-xs text-gray-500 capitalize mb-1">
                    {p.status.toLowerCase().replace(/_/g, " ")}
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {p.count}
                  </p>
                  <div className="h-1 w-full bg-gray-200 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-gray-900 rounded-full"
                      style={{
                        width: `${(p.count / total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
