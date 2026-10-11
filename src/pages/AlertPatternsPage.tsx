import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BarChart3, Clock, Layers, Play } from 'lucide-react';
import { AlertParameter, Crop, FarmAlert, PageId } from '../types/smartfarm';
import { ALERT_PATTERN_BY_HOUR } from '../data/mockData';
import { SensorToRecommendationPipeline } from '../components/Charts';

interface AlertPatternsPageProps {
  alerts: FarmAlert[];
  crops: Crop[];
  onNavigate: (page: PageId) => void;
  onSelectCrop: (cropId: string) => void;
  onSimulateCropReading: (cropId: string, mode: 'normal' | 'stress') => void;
}

export const AlertPatternsPage: React.FC<AlertPatternsPageProps> = ({
  alerts,
  crops,
  onNavigate,
  onSelectCrop,
  onSimulateCropReading,
}) => {
  const [pipelineCropId, setPipelineCropId] = useState<string>(crops[0]?.id || 'crop-1');
  const selectedCrop = crops.find((c) => c.id === pipelineCropId) || crops[0];

  const parameters: AlertParameter[] = [
    'Soil Moisture',
    'Canopy Temp',
    'Soil pH',
    'Soil Nitrogen',
    'Node Battery',
  ];

  const paramCounts = parameters.map((param) => {
    const count = alerts.filter((a) => a.parameter === param).length;
    const unresolved = alerts.filter((a) => a.parameter === param && !a.resolved).length;
    return { param, count, unresolved };
  });

  const maxParamCount = Math.max(...paramCounts.map((p) => p.count), 1);
  const maxHourCount = Math.max(...ALERT_PATTERN_BY_HOUR.map((h) => h.count), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-2xl border border-[#DCE4DF] p-5 lg:p-6">
        <div>
          <div className="text-xs font-bold text-[#145A3A]">
            RULE EVALUATION ENGINE & TELEMETRY ANOMALY ANALYTICS
          </div>
          <h1 className="text-2xl font-bold text-[#0F1E16] tracking-tight mt-0.5">
            Alert Patterns & Interactive Rule Pipeline
          </h1>
          <p className="text-xs text-[#4A5D52] mt-0.5">
            Inspect how simulated sensor readings trigger threshold rules, priority levels, and
            sample recommendations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={selectedCrop.id}
            onChange={(e) => setPipelineCropId(e.target.value)}
            className="px-3 py-2 text-xs font-bold bg-[#F6F7F3] border border-[#145A3A] rounded-xl text-[#0F4C31]"
          >
            {crops.map((c) => (
              <option key={c.id} value={c.id}>
                Pipeline Target: {c.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => onSimulateCropReading(selectedCrop.id, 'stress')}
            className="px-4 py-2 text-xs font-semibold bg-[#0F4C31] hover:bg-[#145A3A] text-white rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 text-[#A3E635]" />
            <span>Fire Rule Test</span>
          </button>
        </div>
      </div>

      {/* Animated Visual Pipeline */}
      <SensorToRecommendationPipeline
        activeCropName={selectedCrop.name}
        moisture={selectedCrop.currentMoisture}
        moistureMin={selectedCrop.thresholds.moistureMin}
        tempC={selectedCrop.currentTempC}
        tempMax={selectedCrop.thresholds.tempMaxC}
        onTriggerTest={() => onSimulateCropReading(selectedCrop.id, 'stress')}
      />

      {/* Parameter & Diurnal Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-white rounded-2xl border border-[#DCE4DF] p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-[#E6ECE8] pb-3">
            <div>
              <h2 className="text-base font-bold text-[#0F1E16]">
                Alerts by Sensor Category & Severity
              </h2>
              <p className="text-xs text-[#4A5D52]">
                Updates dynamically as you trigger simulated stress readings
              </p>
            </div>
            <BarChart3 className="w-4 h-4 text-[#145A3A]" />
          </div>

          <div className="space-y-4">
            {paramCounts.map((item) => {
              const widthPct = Math.round((item.count / maxParamCount) * 100);
              return (
                <div key={item.param} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#0F1E16]">{item.param}</span>
                    <span className="font-mono-tabular text-[#4A5D52]">
                      <strong className="text-[#0F1E16]">{item.count} total</strong> ·{' '}
                      <span className="text-[#B45309] font-semibold">
                        {item.unresolved} active
                      </span>
                    </span>
                  </div>
                  <div className="h-3 w-full bg-[#F1F4EF] rounded-sm overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.max(widthPct, item.count > 0 ? 8 : 0)}%`,
                      }}
                      transition={{ duration: 0.35 }}
                      className="h-full bg-[#145A3A]"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Diurnal 24-Hour Distribution */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-[#DCE4DF] p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-[#E6ECE8] pb-3">
            <div>
              <h2 className="text-base font-bold text-[#0F1E16]">
                Diurnal Anomaly Distribution (24-Hour Cycle)
              </h2>
              <p className="text-xs text-[#4A5D52]">
                Peak evapotranspiration and canopy heat stress cluster between 12:00 and 15:00
              </p>
            </div>
            <Clock className="w-4 h-4 text-[#237A4B]" />
          </div>

          <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 px-2 bg-[#FAFBF9] rounded-xl border border-[#E4EBE6]">
            {ALERT_PATTERN_BY_HOUR.map((slot) => {
              const barHeightPct = Math.round((slot.count / maxHourCount) * 100);
              const isPeak = slot.hour === '12:00' || slot.hour === '15:00';
              return (
                <div
                  key={slot.hour}
                  className="flex-1 flex flex-col items-center justify-end h-full gap-1.5"
                >
                  <span className="text-[11px] font-mono-tabular font-semibold text-[#0F1E16]">
                    {slot.count}
                  </span>
                  <div className="w-full max-w-[34px] bg-[#E8EFEA] rounded-t-md h-28 flex items-end overflow-hidden">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${barHeightPct}%` }}
                      transition={{ duration: 0.35 }}
                      className={`w-full ${
                        isPeak ? 'bg-[#D97706]' : 'bg-[#145A3A]'
                      }`}
                    />
                  </div>
                  <span className="text-[10px] font-mono-tabular text-[#4A5D52]">
                    {slot.hour}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Zone Sensitivity Correlation Table */}
      <div className="bg-white rounded-2xl border border-[#DCE4DF] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E6ECE8] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#0F1E16]">
              Zone Sensitivity & Threshold Rule Matrix
            </h2>
            <p className="text-xs text-[#4A5D52]">
              Summarizes active threshold rules and observed anomaly counts per crop block.
            </p>
          </div>
          <Layers className="w-4 h-4 text-[#145A3A]" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E6ECE8] bg-[#FAFBF9] text-[11px] font-semibold text-[#4A5D52]">
                <th className="py-3 px-4">Crop & Cultivar</th>
                <th className="py-3 px-4">Active Rule Identifiers</th>
                <th className="py-3 px-4 text-right">Safe Moisture Band</th>
                <th className="py-3 px-4 text-right">Safe pH Band</th>
                <th className="py-3 px-4 text-right">Session Alerts</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6ECE8] text-xs">
              {crops.map((crop) => {
                const cropAlerts = alerts.filter((a) => a.cropId === crop.id);
                return (
                  <tr key={crop.id} className="hover:bg-[#F6F7F3]">
                    <td className="py-3 px-4 font-bold text-[#0F1E16]">{crop.name}</td>
                    <td className="py-3 px-4 font-mono-tabular text-[11px] text-[#145A3A]">
                      VWC_BOUND · TEMP_MAX · PH_DRIFT
                    </td>
                    <td className="py-3 px-4 text-right font-mono-tabular text-[#0F1E16]">
                      {crop.thresholds.moistureMin}% – {crop.thresholds.moistureMax}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono-tabular text-[#0F1E16]">
                      {crop.thresholds.phMin} – {crop.thresholds.phMax} pH
                    </td>
                    <td className="py-3 px-4 text-right font-mono-tabular font-bold text-[#0F1E16]">
                      {cropAlerts.length}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          onSelectCrop(crop.id);
                          onNavigate('crop-detail');
                        }}
                        className="font-semibold text-[#145A3A] hover:underline cursor-pointer"
                      >
                        Tune Rules →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
