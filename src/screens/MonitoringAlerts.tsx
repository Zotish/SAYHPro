import { useState } from "react";
import {
  BellRing, AlertTriangle, CheckCircle, ShieldAlert, Zap,
  Activity, Clock, Sliders, Smartphone, Mail, MessageSquare,
  ArrowUpRight, AlertCircle, RefreshCw, Check
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { toast } from "../components/Toast";

interface MonitoringAlertsProps {
  lang: "en" | "bn";
  setScreen: (s: string) => void;
}

export default function MonitoringAlerts({ lang, setScreen }: MonitoringAlertsProps) {
  const {
    monitoringRules,
    businessAlerts,
    toggleMonitoringRule,
    resolveBusinessAlert,
    products,
    customers,
    expenses,
    tNum,
    formatTaka
  } = useApp();

  const isBn = lang === "bn";
  const [filterSeverity, setFilterSeverity] = useState<string>("all");

  const filteredAlerts = businessAlerts.filter(a =>
    filterSeverity === "all" ? true : a.severity === filterSeverity
  );

  const unresolvedCount = businessAlerts.filter(a => !a.resolved).length;
  const activeRulesCount = monitoringRules.filter(r => r.enabled).length;

  return (
    <div className="p-4 sm:p-6 space-y-6 pb-28 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-nv-900">{isBn ? "স্মার্ট মনিটরিং ও অ্যালার্ট সিস্টেম" : "Smart Monitoring & Alert System"}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">24/7 Automated Guardian</span>
          </div>
          <p className="text-nv-500 text-xs sm:text-sm mt-0.5">
            {isBn ? "কম স্টক, উচ্চ বকেয়া ও ক্যাশ গরমিলের স্বয়ংক্রিয় নজরদারি এবং এসএমএস/হোয়াটসঅ্যাপ নোটিফিকেশন" : "Automated business health checks: critical inventory alerts, customer due aging, and daily closing profit summaries"}
          </p>
        </div>

        <div className="flex gap-2 self-start sm:self-auto">
          <button
            onClick={() => toast({ type: "success", title: isBn ? "সিস্টেম স্ক্যান সম্পন্ন!" : "System Scan Complete!", message: "All 4 health monitors are active and synced." })}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-nv-200 rounded-xl text-xs sm:text-sm font-semibold text-nv-700 bg-white hover:bg-nv-50 transition-fast shadow-2xs"
          >
            <RefreshCw size={14} className="text-em-700" />
            <span>{isBn ? "এখনই স্ক্যান করুন" : "Run Live Health Check"}</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-nv-200">
          <div className="flex items-center justify-between text-nv-400 mb-2">
            <span className="text-xs font-semibold uppercase">{isBn ? "অপেক্ষমান সতর্কবার্তা" : "Pending Alerts"}</span>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <ShieldAlert size={16} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-red-600">
            {tNum(unresolvedCount)} {isBn ? "টি অ্যালার্ট" : "Unresolved"}
          </div>
          <div className="text-[11px] text-nv-500 mt-0.5">{isBn ? "তাৎক্ষণিক মনোযোগ প্রয়োজন" : "Requires attention"}</div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-nv-200">
          <div className="flex items-center justify-between text-nv-400 mb-2">
            <span className="text-xs font-semibold uppercase">{isBn ? "সক্রিয় মনিটরিং রুলস" : "Active Monitor Rules"}</span>
            <div className="w-8 h-8 rounded-xl bg-em-50 text-em-700 flex items-center justify-center">
              <Activity size={16} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-em-700">
            {tNum(activeRulesCount)} / {tNum(monitoringRules.length)}
          </div>
          <div className="text-[11px] text-nv-500 mt-0.5">{isBn ? "২৪/৭ স্বয়ংক্রিয় চালু" : "Running in background"}</div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-nv-200">
          <div className="flex items-center justify-between text-nv-400 mb-2">
            <span className="text-xs font-semibold uppercase">{isBn ? "স্বয়ংক্রিয় এসএমএস রিপোর্ট" : "Automated SMS Brief"}</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Smartphone size={16} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-blue-700">
            ১০:০০ PM
          </div>
          <div className="text-[11px] text-emerald-600 font-bold mt-0.5">{isBn ? "প্রতিদিন রাত ১০টায় লাভ মেসেজ" : "Daily closing SMS active"}</div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-nv-200">
          <div className="flex items-center justify-between text-nv-400 mb-2">
            <span className="text-xs font-semibold uppercase">{isBn ? "ঝুঁকি স্কোর (Risk Level)" : "Store Risk Index"}</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Zap size={16} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-purple-700">
            {isBn ? "নিরাপদ (Low)" : "Low (Safe)"}
          </div>
          <div className="text-[11px] text-nv-500 mt-0.5">{isBn ? "ক্যাশ ও স্টক ব্যালেন্স ঠিক আছে" : "Healthy store metrics"}</div>
        </div>
      </div>

      {/* Grid: Configured Rules + Live Alerts Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monitoring Rules Config (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-nv-200 space-y-4">
          <h3 className="font-display font-bold text-nv-900 text-base flex items-center gap-2 pb-2 border-b border-nv-100">
            <Sliders size={18} className="text-em-700" />
            <span>{isBn ? "অটোমেটেড মনিটরিং রুলস" : "Automated Trigger Rules"}</span>
          </h3>

          <div className="space-y-3 text-xs sm:text-sm">
            {monitoringRules.map(rule => (
              <div key={rule.id} className="p-3.5 bg-nv-50 rounded-2xl border border-nv-200/60 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="font-bold text-nv-900">{isBn ? rule.nameBn : rule.name}</div>
                  <div className="text-[11px] text-nv-500 flex items-center gap-1.5">
                    <span className="uppercase font-mono font-bold text-em-700 bg-em-50 px-1.5 py-0.5 rounded">
                      {rule.channel}
                    </span>
                    <span>Last triggered: {rule.lastTriggered || "Never"}</span>
                  </div>
                </div>

                <button
                  onClick={() => toggleMonitoringRule(rule.id)}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 flex-shrink-0
                    ${rule.enabled ? "bg-em-600" : "bg-nv-300"}`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform
                      ${rule.enabled ? "translate-x-5" : "translate-x-0"}`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Live Alerts Stream (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-nv-200 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-nv-100">
            <h3 className="font-display font-bold text-nv-900 text-base flex items-center gap-2">
              <BellRing size={18} className="text-red-500" />
              <span>{isBn ? "লাইভ বিজনেস অ্যালার্ট ফিড" : "Live Business Alerts Feed"}</span>
            </h3>

            <div className="flex gap-1.5">
              {["all", "critical", "warning", "info"].map(sev => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase transition-fast
                    ${filterSeverity === sev ? "bg-nv-900 text-white" : "bg-nv-100 text-nv-600 hover:bg-nv-200"}`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredAlerts.map(alert => (
              <div
                key={alert.id}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3
                  ${alert.resolved ? "bg-nv-50/50 border-nv-200 opacity-60" :
                    alert.severity === "critical" ? "bg-red-50/40 border-red-200" :
                    alert.severity === "warning" ? "bg-amber-50/40 border-amber-200" : "bg-blue-50/40 border-blue-200"}`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase
                      ${alert.severity === "critical" ? "bg-red-100 text-red-700" :
                        alert.severity === "warning" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-700"}`}>
                      {alert.severity}
                    </span>
                    <span className="text-[11px] text-nv-400 font-mono">{tNum(alert.time)}</span>
                  </div>

                  <h4 className="font-bold text-sm text-nv-900">{isBn ? alert.titleBn : alert.title}</h4>
                  <p className="text-xs text-nv-600 leading-relaxed">{isBn ? alert.messageBn : alert.message}</p>
                </div>

                {!alert.resolved ? (
                  <button
                    onClick={() => resolveBusinessAlert(alert.id)}
                    className="px-3 py-1.5 bg-white border border-nv-200 hover:border-em-500 text-nv-800 hover:text-em-800 rounded-xl text-xs font-bold shadow-2xs transition-fast flex-shrink-0 flex items-center gap-1"
                  >
                    <Check size={13} /> {isBn ? "সমাধান" : "Resolve"}
                  </button>
                ) : (
                  <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 flex-shrink-0">
                    <CheckCircle size={14} /> Resolved
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
