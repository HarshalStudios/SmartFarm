import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  SlidersHorizontal,
} from 'lucide-react';
import { Crop, FarmAlert, PageId } from '../types/smartfarm';

interface AlertsAdvicePageProps {
  alerts: FarmAlert[];
  crops: Crop[];
  onResolveAlert: (alertId: string, note?: string) => void;
  onResolveAll: () => void;
  onSimulateCropReading: (cropId: string, mode: 'normal' | 'stress') => void;
  onSelectCrop: (cropId: string) => void;
  onNavigate: (page: PageId) => void;
}

export const AlertsAdvicePage: React.FC<AlertsAdvicePageProps> = ({
  alerts,
  crops,
  onResolveAlert,
  onResolveAll,
  onSimulateCropReading,
  onSelectCrop,
  onNavigate,
}) => {
  const [statusFilter, setStatusFilter] = useState<'active' | 'resolved' | 'all'>('active');
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});

  const filteredAlerts = alerts.filter((alert) => {
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'active'
        ? !alert.resolved
        : alert.resolved;
    const matchesSeverity = severityFilter === 'All' || alert.severity === severityFilter;
    return matchesStatus && matchesSeverity;
  });

  const activeCount = alerts.filter((a) => !a.resolved).length;
  const resolvedCount = alerts.filter((a) => a.resolved).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-2xl border border-[#DCE4DF] p-5 lg:p-6">
        <div>
          <div className="text-xs font-bold text-[#145A3A]">
            RULE-TRIGGERED ANOMALIES & PROTOTYPE DECISION SUPPORT
          </div>
          <h1 className="text-2xl font-bold text-[#0F1E16] tracking-tight mt-0.5">
            Alerts & Sample Agronomic Advice
          </h1>
          <p className="text-xs text-[#4A5D52] mt-0.5">
            Generated automatically when simulated sensor readings cross configured crop bounds.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() =>
              onSimulateCropReading(
                crops[Math.floor(Math.random() * crops.length)]?.id || 'crop-1',
                'stress'
              )
            }
            className="px-3.5 py-2 text-xs font-semibold bg-[#B45309] hover:bg-[#92400E] text-white rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Simulate Threshold Breach</span>
          </button>

          {activeCount > 0 && (
            <button
              onClick={onResolveAll}
              className="px-3.5 py-2 text-xs font-semibold bg-[#0F4C31] hover:bg-[#145A3A] text-white rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#A3E635]" />
              <span>Mark All Resolved ({activeCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Mandatory Non-Prescriptive Academic Disclaimer */}
      <div className="bg-white rounded-2xl border border-[#DCE4DF] p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-[#145A3A] shrink-0 mt-0.5" />
        <div className="text-xs text-[#4A5D52] leading-relaxed">
          <strong className="text-[#0F1E16]">
            Academic Prototype Disclaimer (Non-Validated Sample Logic):
          </strong>{' '}
          All irrigation durations, valve actions, and nutrient notes displayed below are
          illustrative software rules built to demonstrate threshold-to-advice UI workflows to our
          college evaluation committee. They are <strong>not</strong> scientifically validated
          fertilizer doses or agronomic prescriptions.
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#DCE4DF] p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-[#F6F7F3] rounded-xl border border-[#DCE4DF]">
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-[#0F4C31] text-white'
                : 'text-[#4A5D52] hover:text-[#0F1E16]'
            }`}
          >
            Active Unresolved ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('resolved')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              statusFilter === 'resolved'
                ? 'bg-[#0F4C31] text-white'
                : 'text-[#4A5D52] hover:text-[#0F1E16]'
            }`}
          >
            Resolved ({resolvedCount})
          </button>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-[#0F4C31] text-white'
                : 'text-[#4A5D52] hover:text-[#0F1E16]'
            }`}
          >
            All History ({alerts.length})
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#4A5D52]" />
          <span className="text-[#4A5D52] font-medium">Severity:</span>
          {['All', 'Critical', 'Warning', 'Advisory'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                severityFilter === sev
                  ? 'bg-[#1D7049] text-white'
                  : 'bg-[#F6F7F3] text-[#4A5D52] hover:text-[#0F1E16]'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#DCE4DF] p-10 text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-[#145A3A] mx-auto" />
          <div className="text-sm font-bold text-[#0F1E16]">
            No alerts match this filter view
          </div>
          <p className="text-xs text-[#4A5D52]">
            Click "Simulate Threshold Breach" above to test how SmartFarm triggers a new alert.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-white rounded-2xl border border-[#DCE4DF] p-5 space-y-3"
            >
              {/* Metadata Row */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`font-bold ${
                      alert.severity === 'Critical'
                        ? 'text-[#DC2626]'
                        : alert.severity === 'Warning'
                        ? 'text-[#B45309]'
                        : 'text-[#145A3A]'
                    }`}
                  >
                    {alert.severity.toUpperCase()} · {alert.parameter}
                  </span>
                  <span aria-hidden="true">·</span>
                  <button
                    onClick={() => {
                      onSelectCrop(alert.cropId);
                      onNavigate('crop-detail');
                    }}
                    className="font-bold text-[#0F1E16] hover:text-[#145A3A] hover:underline cursor-pointer"
                  >
                    {alert.cropName}
                  </button>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#4A5D52]">
                    {alert.plotName} ({alert.farmName})
                  </span>
                </div>

                <div className="font-mono-tabular text-[#4A5D52]">
                  {alert.timestamp} ·{' '}
                  <strong className="text-[#0F1E16]">
                    Measured {alert.measuredValue}
                  </strong>{' '}
                  (Limit: {alert.thresholdValue})
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-[#0F1E16]">{alert.message}</p>
                <span className="text-[11px] font-mono-tabular text-[#145A3A] font-semibold">
                  Rule: {alert.ruleTriggered}
                </span>
              </div>

              {/* Sample Prototype Advice Box */}
              <div className="p-3.5 rounded-xl bg-[#F6F7F3] border border-[#DCE4DF] text-xs text-[#0F1E16] leading-relaxed">
                {alert.prototypeAdvice}
              </div>

              {/* Resolution Controls */}
              {alert.resolved ? (
                <div className="pt-2 border-t border-[#E6ECE8] flex flex-wrap items-center justify-between gap-2 text-xs text-[#145A3A]">
                  <span className="font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      Resolved at {alert.resolvedAt}{' '}
                      {alert.resolutionNote ? `— "${alert.resolutionNote}"` : ''}
                    </span>
                  </span>
                </div>
              ) : (
                <div className="pt-2 border-t border-[#E6ECE8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <input
                    type="text"
                    placeholder="Optional field resolution note (e.g., Inspected drip line A1)..."
                    value={noteInputs[alert.id] || ''}
                    onChange={(e) =>
                      setNoteInputs({ ...noteInputs, [alert.id]: e.target.value })
                    }
                    className="flex-1 px-3.5 py-2 text-xs bg-[#F6F7F3] border border-[#C5D6CC] rounded-xl focus:bg-white focus:outline-none focus:border-[#145A3A]"
                  />
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        onSelectCrop(alert.cropId);
                        onNavigate('crop-detail');
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-[#145A3A] hover:underline cursor-pointer"
                    >
                      Inspect Crop Sensors
                    </button>
                    <button
                      onClick={() =>
                        onResolveAlert(
                          alert.id,
                          noteInputs[alert.id]?.trim() ||
                            'Acknowledged and marked resolved in demo session.'
                        )
                      }
                      className="px-4 py-2 text-xs font-semibold bg-[#0F4C31] hover:bg-[#145A3A] text-white rounded-xl transition-colors cursor-pointer"
                    >
                      Mark Resolved
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
