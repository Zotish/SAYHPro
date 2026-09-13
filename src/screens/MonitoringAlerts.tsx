import { useState } from "react";
import {
  CheckCircle, Sliders, RefreshCw, Check, ArrowLeft
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { toast } from "../components/Toast";

interface MonitoringAlertsProps {
  lang: "en" | "bn";
  setScreen: (s: string) => void;
  onBack?: () => void;
}

export default function MonitoringAlerts({ lang, setScreen, onBack }: MonitoringAlertsProps) {
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
      <div className="flex items-center justify-between gap-3">
        {onBack ? (
          <button
            onClick={onBack}
            aria-label={isBn ? "পেছনে যান" : "Go back"}
            className="lg:hidden flex-shrink-0 w-9 h-9 rounded-full bg-nv-100 flex items-center justify-center text-ink active:bg-nv-200"
          >
            <ArrowLeft size={18} />
          </button>
        ) : <div />}

        <button
          onClick={() => toast({ type: "success", title: isBn ? "সিস্টেম স্ক্যান সম্পন্ন!" : "System Scan Complete!", message: "All 4 health monitors are active and synced." })}
          className="ml-auto flex items-center gap-1.5 px-3.5 py-2 border border-nv-200 rounded-xl text-xs sm:text-sm font-semibold text-ink bg-white hover:bg-nv-50 transition-fast shadow-2xs whitespace-nowrap"
        >
          <RefreshCw size={14} className="text-ink" />
          <span>{isBn ? "এখনই স্ক্যান করুন" : "Run Live Health Check"}</span>
        </button>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-nv-200">
          <div className="text-sm font-semibold text-ink/80 mb-1.5">{isBn ? "পেন্ডিং অ্যালার্ট" : "Pending Alerts"}</div>
          <div className="text-lg sm:text-xl font-bold text-ink">
            {tNum(unresolvedCount)}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-nv-200">
          <div className="text-sm font-semibold text-ink/80 mb-1.5">{isBn ? "অ্যাক্টিভ রুলস" : "Active Rules"}</div>
          <div className="text-lg sm:text-xl font-bold text-ink">
            {tNum(activeRulesCount)} / {tNum(monitoringRules.length)}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-nv-200">
          <div className="text-sm font-semibold text-ink/80 mb-1.5">{isBn ? "ডেইলি এসএমএস" : "Daily SMS"}</div>
          <div className="text-lg sm:text-xl font-bold text-ink">
            {isBn ? "১০:০০ PM" : "10:00 PM"}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-nv-200">
          <div className="text-sm font-semibold text-ink/80 mb-1.5">{isBn ? "ঝুঁকির মাত্রা" : "Risk Level"}</div>
          <div className="text-lg sm:text-xl font-bold text-ink">
            {isBn ? "নিরাপদ (Low)" : "Low (Safe)"}
          </div>
        </div>
      </div>

      {/* Grid: Configured Rules + Live Alerts Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monitoring Rules Config (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-nv-200 space-y-4">
          <h3 className="font-display font-bold text-ink text-base flex items-center gap-2 pb-2 border-b border-nv-100">
            <Sliders size={18} className="text-ink" />
            <span>{isBn ? "অটোমেটেড মনিটরিং রুলস" : "Automated Trigger Rules"}</span>
          </h3>

          <div className="space-y-3 text-xs sm:text-sm">
            {monitoringRules.map(rule => (
              <div key={rule.id} className="p-3.5 bg-nv-50 rounded-2xl border border-nv-200/60 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="font-bold text-ink">{isBn ? rule.nameBn : rule.name}</div>
                  <div className="text-[11px] text-ink flex items-center gap-1.5">
                    <span className="uppercase font-mono font-bold text-ink bg-em-50 px-1.5 py-0.5 rounded">
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
          <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-nv-100">
            <h3 className="font-display font-bold text-ink text-base whitespace-nowrap">
              {isBn ? "লাইভ অ্যালার্ট ফিড" : "Live Alerts Feed"}
            </h3>

            <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 flex-shrink-0">
              {["all", "critical", "warning", "info"].map(sev => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold uppercase whitespace-nowrap transition-fast
                    ${filterSeverity === sev ? "bg-nv-900 text-white" : "bg-nv-100 text-ink hover:bg-nv-200"}`}
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
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 bg-white
                  ${alert.resolved ? "border-nv-200 opacity-60" :
                    alert.severity === "critical" ? "border-red-200" :
                    alert.severity === "warning" ? "border-ac-200" : "border-nv-200"}`}
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase flex-shrink-0
                      ${alert.severity === "critical" ? "bg-red-100 text-red-700 font-bold" :
                        alert.severity === "warning" ? "bg-amber-100 text-amber-800 font-bold" : "bg-nv-100 text-ink"}`}>
                      {alert.severity}
                    </span>
                    <span className="text-[11px] text-ink/70 font-mono">
                      {isBn ? (alert.time === "Yesterday" ? "গতকাল" : alert.time.replace("hours ago", "ঘণ্টা আগে")) : alert.time}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-ink">{isBn ? alert.titleBn : alert.title}</h4>
                  <p className="text-xs text-ink/80 leading-relaxed">{isBn ? alert.messageBn : alert.message}</p>
                </div>

                {!alert.resolved ? (
                  <button
                    onClick={() => resolveBusinessAlert(alert.id)}
                    className="px-3 py-1.5 bg-white border border-nv-200 hover:border-em-500 text-ink rounded-xl text-xs font-bold shadow-2xs transition-fast flex-shrink-0 flex items-center gap-1"
                  >
                    <Check size={13} /> {isBn ? "সমাধান" : "Resolve"}
                  </button>
                ) : (
                  <span className="text-xs text-ink/70 font-bold flex items-center gap-1 flex-shrink-0">
                    <CheckCircle size={14} className="text-em-600" /> Resolved
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
