import React from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from "recharts";

export const PALETTE = ["#0c6b58", "#17a189", "#6fc2ae", "#c9973f", "#23698a", "#a16a08", "#bc4444"];

const tooltipStyle = {
  borderRadius: 10, border: "1px solid #dde8e2", fontSize: 12, fontFamily: "'IBM Plex Sans', sans-serif",
  boxShadow: "0 8px 24px -12px rgba(12,43,37,.3)", background: "#fff",
};
const tick = { fontSize: 11, fill: "#55716a", fontFamily: "'IBM Plex Sans', sans-serif" };
const fmtK = (v: number) => (v >= 1000 ? `₹${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k` : `₹${v}`);

export function RevenueArea({ data, height = 260 }: { data: { label: string; opd: number; ipd: number; pharmacy: number; lab: number; radiology: number }[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <defs>
          {[["opd", "#0c6b58"], ["ipd", "#23698a"], ["pharmacy", "#17a189"], ["lab", "#c9973f"], ["radiology", "#6fc2ae"]].map(([k, c]) => (
            <linearGradient key={k} id={`g-${k}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={c as string} stopOpacity={0.35} />
              <stop offset="100%" stopColor={c as string} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5eee9" vertical={false} />
        <XAxis dataKey="label" tick={tick} axisLine={false} tickLine={false} interval="preserveStartEnd" />
        <YAxis tick={tick} axisLine={false} tickLine={false} tickFormatter={fmtK} width={52} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v: number | string, n: string) => [`₹${Number(v).toLocaleString("en-IN")}`, n]} />
        <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" iconSize={7} />
        <Area type="monotone" dataKey="opd" name="OPD" stackId="1" stroke="#0c6b58" strokeWidth={2} fill="url(#g-opd)" />
        <Area type="monotone" dataKey="ipd" name="IPD" stackId="1" stroke="#23698a" strokeWidth={2} fill="url(#g-ipd)" />
        <Area type="monotone" dataKey="pharmacy" name="Pharmacy" stackId="1" stroke="#17a189" strokeWidth={2} fill="url(#g-pharmacy)" />
        <Area type="monotone" dataKey="lab" name="Lab" stackId="1" stroke="#c9973f" strokeWidth={2} fill="url(#g-lab)" />
        <Area type="monotone" dataKey="radiology" name="Radiology" stackId="1" stroke="#6fc2ae" strokeWidth={2} fill="url(#g-radiology)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function Donut({ data, height = 220, money }: { data: { name: string; value: number }[]; height?: number; money?: boolean }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="82%" paddingAngle={3} strokeWidth={0}>
          {data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} formatter={(v: number | string, n: string) => [money ? `₹${Number(v).toLocaleString("en-IN")}` : Number(v).toLocaleString("en-IN"), n]} />
        <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" iconSize={7} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function HBars({ data, height = 240, money }: { data: { name: string; value: number; extra?: number }[]; height?: number; money?: boolean }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5eee9" vertical={false} />
        <XAxis dataKey="name" tick={tick} axisLine={false} tickLine={false} />
        <YAxis tick={tick} axisLine={false} tickLine={false} tickFormatter={money ? fmtK : undefined} width={52} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(12,107,88,0.05)" }} formatter={(v: number | string, n: string) => [money ? `₹${Number(v).toLocaleString("en-IN")}` : Number(v).toLocaleString("en-IN"), n]} />
        <Bar dataKey="value" name={money ? "Revenue" : "Patients"} fill="#0c6b58" radius={[6, 6, 0, 0]} maxBarSize={34} />
        {data.some((d) => d.extra !== undefined) && <Bar dataKey="extra" name="Appointments" fill="#6fc2ae" radius={[6, 6, 0, 0]} maxBarSize={34} />}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function Spark({ data, color = "#0c6b58", height = 44 }: { data: number[]; color?: string; height?: number }) {
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${40 - (v / max) * 36}`).join(" ");
  return (
    <svg viewBox="0 0 100 44" preserveAspectRatio="none" style={{ height, width: "100%" }} aria-hidden="true">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <polygon points={`0,44 ${pts} 100,44`} fill={color} opacity="0.09" />
    </svg>
  );
}
