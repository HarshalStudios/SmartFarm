import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Crop,
  Farm,
  IrrigationLog,
  SensorReading,
} from '../types/smartfarm';
import { Cpu, Sliders, Bell, CheckCircle2, ArrowRight } from 'lucide-react';

interface TelemetryChartProps {
  history: SensorReading[];
  metric: 'moisture' | 'tempC' | 'humidity' | 'ph' | 'ecDsM';
  showSoilTempOverlay?: boolean;
  minThreshold?: number;
  maxThreshold?: number;
  unit: string;
  label: string;
  tempUnit?: 'C' | 'F';
}

export const TelemetryLineChart: React.FC<TelemetryChartProps> = ({
  history,
  metric,
  showSoilTempOverlay = false,
  minThreshold,
  maxThreshold,
  unit,
  label,
  tempUnit = 'C',
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const convertVal = (val: number, isTemp = false) => {
    if ((metric === 'tempC' || isTemp) && tempUnit === 'F') {
      return Number(((val * 9) / 5 + 32).toFixed(1));
    }
    return Number(val.toFixed(1));
  };

  const displayMinThreshold =
    minThreshold !== undefined
      ? metric === 'tempC' && tempUnit === 'F'
        ? Number(((minThreshold * 9) / 5 + 32).toFixed(1))
        : minThreshold
      : undefined;

  const displayMaxThreshold =
    maxThreshold !== undefined
      ? metric === 'tempC' && tempUnit === 'F'
        ? Number(((maxThreshold * 9) / 5 + 32).toFixed(1))
        : maxThreshold
      : undefined;

  const values = history.map((h) => convertVal(h[metric]));
  const soilTempValues =
    metric === 'tempC' && showSoilTempOverlay
      ? history.map((h) => convertVal(h.soilTempC ?? h.tempC - 3.2, true))
      : [];

  const allPoints = [
    ...values,
    ...soilTempValues,
    ...(displayMinThreshold !== undefined ? [displayMinThreshold] : []),
    ...(displayMaxThreshold !== undefined ? [displayMaxThreshold] : []),
  ];

  const rawMin = Math.min(...allPoints);
  const rawMax = Math.max(...allPoints);
  const padding = Math.max((rawMax - rawMin) * 0.22, metric === 'ph' || metric === 'ecDsM' ? 0.5 : 3);
  const yMin = Math.max(0, Number((rawMin - padding).toFixed(1)));
  const yMax = Number((rawMax + padding).toFixed(1));
  const range = Math.max(yMax - yMin, 0.5);

  const width = 680;
  const height = 240;
  const padLeft = 48;
  const padRight = 24;
  const padTop = 22;
  const padBottom = 34;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const getX = (i: number) =>
    padLeft + (history.length <= 1 ? plotW / 2 : (i / (history.length - 1)) * plotW);
  const getY = (v: number) => padTop + plotH - ((v - yMin) / range) * plotH;

  const points = values.map((v, i) => `${getX(i)},${getY(v)}`).join(' ');
  const soilPoints =
    soilTempValues.length > 0
      ? soilTempValues.map((v, i) => `${getX(i)},${getY(v)}`).join(' ')
      : '';
  const areaPoints = `${getX(0)},${padTop + plotH} ${points} ${getX(values.length - 1)},${
    padTop + plotH
  }`;

  const yTicks = [yMin, yMin + range * 0.33, yMin + range * 0.66, yMax].map((v) =>
    metric === 'ph' || metric === 'ecDsM' ? Number(v.toFixed(1)) : Math.round(v)
  );

  const historicalAvg =
    values.length > 0
      ? Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1))
      : 0;
  const latestVal = values[values.length - 1] ?? 0;

  return (
    <div className="w-full space-y-3">
      {/* Chart Header & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="text-sm font-bold text-[#0F1E16]">{label}</span>
          <span className="text-xs text-[#4A5D52] ml-2 font-mono-tabular">
            (Current: <strong className="text-[#145A3A]">{latestVal}{unit}</strong> vs Period Avg:{' '}
            <strong>{historicalAvg}{unit}</strong>)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-[#4A5D52]">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#145A3A] inline-block" />
            <span>{metric === 'tempC' ? 'Ambient Canopy' : 'Measured Value'}</span>
          </span>
          {metric === 'tempC' && showSoilTempOverlay && (
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#84CC16] inline-block" />
              <span>Root-Zone Soil Temp</span>
            </span>
          )}
          {displayMinThreshold !== undefined && (
            <span className="font-mono-tabular">
              Safe Min: <strong className="text-[#B45309]">{displayMinThreshold}{unit}</strong>
            </span>
          )}
          {displayMaxThreshold !== undefined && (
            <span className="font-mono-tabular">
              Safe Max: <strong className="text-[#DC2626]">{displayMaxThreshold}{unit}</strong>
            </span>
          )}
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-hidden bg-[#FAFBF9] rounded-xl border border-[#E4EBE6] p-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-56 overflow-visible select-none"
          role="img"
          aria-label={label}
        >
          <defs>
            <linearGradient id={`grad-area-${metric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#145A3A" stopOpacity="0.24" />
              <stop offset="100%" stopColor="#84CC16" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Safe Operating Band Highlight */}
          {displayMinThreshold !== undefined && displayMaxThreshold !== undefined && (
            <rect
              x={padLeft}
              y={getY(displayMaxThreshold)}
              width={plotW}
              height={Math.max(0, getY(displayMinThreshold) - getY(displayMaxThreshold))}
              fill="#145A3A"
              fillOpacity="0.04"
            />
          )}

          {/* Horizontal Grid Lines & Y-Axis Labels */}
          {yTicks.map((tick, idx) => {
            const y = getY(tick);
            return (
              <g key={idx}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="#E2E8E4"
                  strokeDasharray="3 3"
                />
                <text
                  x={padLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[11px] fill-[#52665A] font-mono-tabular"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Min Threshold Line */}
          {displayMinThreshold !== undefined && (
            <g>
              <line
                x1={padLeft}
                y1={getY(displayMinThreshold)}
                x2={width - padRight}
                y2={getY(displayMinThreshold)}
                stroke="#D97706"
                strokeWidth="1.5"
                strokeDasharray="5 4"
              />
              <text
                x={width - padRight - 4}
                y={getY(displayMinThreshold) - 5}
                textAnchor="end"
                className="text-[10px] fill-[#B45309] font-mono-tabular font-semibold"
              >
                Caution Min {displayMinThreshold}{unit}
              </text>
            </g>
          )}

          {/* Max Threshold Line */}
          {displayMaxThreshold !== undefined && (
            <g>
              <line
                x1={padLeft}
                y1={getY(displayMaxThreshold)}
                x2={width - padRight}
                y2={getY(displayMaxThreshold)}
                stroke="#DC2626"
                strokeWidth="1.5"
                strokeDasharray="5 4"
              />
              <text
                x={width - padRight - 4}
                y={getY(displayMaxThreshold) - 5}
                textAnchor="end"
                className="text-[10px] fill-[#B91C1C] font-mono-tabular font-semibold"
              >
                Critical Max {displayMaxThreshold}{unit}
              </text>
            </g>
          )}

          {/* Area Fill & Primary Line */}
          <polygon points={areaPoints} fill={`url(#grad-area-${metric})`} />
          <polyline
            fill="none"
            stroke="#145A3A"
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />

          {/* Secondary Soil Temp Overlay Line */}
          {soilPoints && (
            <polyline
              fill="none"
              stroke="#65A30D"
              strokeWidth="2"
              strokeDasharray="4 3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={soilPoints}
            />
          )}

          {/* Interactive Data Points */}
          {values.map((v, i) => {
            const cx = getX(i);
            const cy = getY(v);
            const isOutOfBounds =
              (displayMinThreshold !== undefined && v < displayMinThreshold) ||
              (displayMaxThreshold !== undefined && v > displayMaxThreshold);
            const isHovered = hoverIndex === i;
            const soilV = soilTempValues[i];

            return (
              <g
                key={history[i].id || i}
                className="cursor-pointer"
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
              >
                <circle cx={cx} cy={cy} r={14} fill="transparent" />
                {soilV !== undefined && (
                  <circle
                    cx={cx}
                    cy={getY(soilV)}
                    r={3.5}
                    fill="#65A30D"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                  />
                )}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 6.5 : 4.5}
                  fill={isOutOfBounds ? '#DC2626' : '#145A3A'}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />

                {/* X-Axis Timestamp */}
                <text
                  x={cx}
                  y={height - 8}
                  textAnchor="middle"
                  className="text-[10px] fill-[#4A5D52] font-mono-tabular"
                >
                  {history[i].timestamp}
                </text>

                {/* Tooltip */}
                {isHovered && (
                  <g>
                    <rect
                      x={Math.min(Math.max(cx - 68, padLeft), width - 148)}
                      y={Math.max(cy - 48, 4)}
                      width="138"
                      height={soilV !== undefined ? '38' : '26'}
                      rx="6"
                      fill="#0F291E"
                    />
                    <text
                      x={Math.min(Math.max(cx - 68, padLeft), width - 148) + 69}
                      y={Math.max(cy - 48, 4) + 16}
                      textAnchor="middle"
                      className="text-[11px] fill-white font-mono-tabular font-semibold"
                    >
                      {history[i].timestamp}: {v}
                      {unit}
                    </text>
                    {soilV !== undefined && (
                      <text
                        x={Math.min(Math.max(cx - 68, padLeft), width - 148) + 69}
                        y={Math.max(cy - 48, 4) + 31}
                        textAnchor="middle"
                        className="text-[10px] fill-[#A3E635] font-mono-tabular"
                      >
                        Soil Temp: {soilV}
                        {unit}
                      </text>
                    )}
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

interface PhEcGaugeProps {
  ph: number;
  phMin: number;
  phMax: number;
  ecDsM: number;
  ecMin: number;
  ecMax: number;
}

export const PhEcRangeGauge: React.FC<PhEcGaugeProps> = ({
  ph,
  phMin,
  phMax,
  ecDsM,
  ecMin,
  ecMax,
}) => {
  // Scale pH between 4.5 and 8.0
  const phPct = Math.min(100, Math.max(2, ((ph - 4.5) / 3.5) * 100));
  const phSafeStart = Math.max(0, ((phMin - 4.5) / 3.5) * 100);
  const phSafeWidth = Math.max(5, ((phMax - phMin) / 3.5) * 100);
  const phStatus =
    ph < phMin - 0.3 || ph > phMax + 0.3
      ? 'Critical'
      : ph < phMin || ph > phMax
      ? 'Caution'
      : 'Safe Range';

  // Scale EC between 0.5 and 3.5 dS/m
  const ecPct = Math.min(100, Math.max(2, ((ecDsM - 0.5) / 3.0) * 100));
  const ecSafeStart = Math.max(0, ((ecMin - 0.5) / 3.0) * 100);
  const ecSafeWidth = Math.max(5, ((ecMax - ecMin) / 3.0) * 100);
  const ecStatus =
    ecDsM < ecMin - 0.3 || ecDsM > ecMax + 0.3
      ? 'Critical'
      : ecDsM < ecMin || ecDsM > ecMax
      ? 'Caution'
      : 'Safe Range';

  return (
    <div className="space-y-5">
      {/* Soil pH Spectrum */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-[#0F1E16]">Root-Zone Soil pH</span>
            <span className="text-[#4A5D52] ml-2 font-mono-tabular">
              (Safe: {phMin.toFixed(1)} – {phMax.toFixed(1)} pH)
            </span>
          </div>
          <span
            className={`font-mono-tabular font-bold ${
              phStatus === 'Safe Range'
                ? 'text-[#145A3A]'
                : phStatus === 'Caution'
                ? 'text-[#B45309]'
                : 'text-[#DC2626]'
            }`}
          >
            {ph.toFixed(1)} pH · {phStatus}
          </span>
        </div>

        <div className="relative h-3.5 w-full rounded-md bg-gradient-to-r from-[#FCA5A5] via-[#E5ECE7] to-[#FCD34D] overflow-hidden border border-[#D5E0D9]">
          {/* Safe Optimal Band */}
          <div
            className="absolute top-0 bottom-0 bg-[#145A3A]/80"
            style={{ left: `${phSafeStart}%`, width: `${phSafeWidth}%` }}
            title={`Safe pH range: ${phMin} - ${phMax}`}
          />
          {/* Pointer */}
          <motion.div
            initial={{ left: '50%' }}
            animate={{ left: `${phPct}%` }}
            transition={{ duration: 0.35 }}
            className="absolute top-0 bottom-0 w-1.5 -ml-0.5 bg-[#0F1E16] border border-white shadow"
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono-tabular text-[#5A6D62]">
          <span>4.5 (Acidic Critical)</span>
          <span>Optimal Root Band ({phMin}–{phMax})</span>
          <span>8.0 (Alkaline Critical)</span>
        </div>
      </div>

      {/* Electrical Conductivity (EC) Spectrum */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-[#0F1E16]">Electrical Conductivity (EC)</span>
            <span className="text-[#4A5D52] ml-2 font-mono-tabular">
              (Safe: {ecMin.toFixed(1)} – {ecMax.toFixed(1)} dS/m)
            </span>
          </div>
          <span
            className={`font-mono-tabular font-bold ${
              ecStatus === 'Safe Range'
                ? 'text-[#145A3A]'
                : ecStatus === 'Caution'
                ? 'text-[#B45309]'
                : 'text-[#DC2626]'
            }`}
          >
            {ecDsM.toFixed(2)} dS/m · {ecStatus}
          </span>
        </div>

        <div className="relative h-3.5 w-full rounded-md bg-gradient-to-r from-[#FDE68A] via-[#E5ECE7] to-[#FCA5A5] overflow-hidden border border-[#D5E0D9]">
          <div
            className="absolute top-0 bottom-0 bg-[#237A4B]/80"
            style={{ left: `${ecSafeStart}%`, width: `${ecSafeWidth}%` }}
            title={`Safe EC range: ${ecMin} - ${ecMax} dS/m`}
          />
          <motion.div
            initial={{ left: '50%' }}
            animate={{ left: `${ecPct}%` }}
            transition={{ duration: 0.35 }}
            className="absolute top-0 bottom-0 w-1.5 -ml-0.5 bg-[#0F1E16] border border-white shadow"
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono-tabular text-[#5A6D62]">
          <span>0.5 dS/m (Nutrient Low)</span>
          <span>Safe Salinity Band ({ecMin}–{ecMax})</span>
          <span>3.5 dS/m (Salinity Stress)</span>
        </div>
      </div>
    </div>
  );
};

interface NpkComparisonProps {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  nitrogenMin: number;
}

export const NpkBarChart: React.FC<NpkComparisonProps> = ({
  nitrogen,
  phosphorus,
  potassium,
  nitrogenMin,
}) => {
  const items = [
    {
      label: 'Nitrogen (N)',
      value: nitrogen,
      target: nitrogenMin,
      maxScale: 220,
      unit: 'mg/kg',
      warning: nitrogen < nitrogenMin,
    },
    {
      label: 'Phosphorus (P)',
      value: phosphorus,
      target: 45,
      maxScale: 120,
      unit: 'mg/kg',
      warning: phosphorus < 45,
    },
    {
      label: 'Potassium (K)',
      value: potassium,
      target: 140,
      maxScale: 250,
      unit: 'mg/kg',
      warning: potassium < 140,
    },
  ];

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const pct = Math.min(100, Math.round((item.value / item.maxScale) * 100));
        const targetPct = Math.min(100, Math.round((item.target / item.maxScale) * 100));
        return (
          <div key={item.label} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#0F1E16]">{item.label}</span>
              <span className="font-mono-tabular text-[#4A5D52]">
                <strong className={item.warning ? 'text-[#B45309]' : 'text-[#145A3A]'}>
                  {item.value} {item.unit}
                </strong>{' '}
                · Target ≥ {item.target} {item.unit}
              </span>
            </div>
            <div className="relative h-3 w-full bg-[#E5EBE6] rounded-sm overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.4 }}
                className={`h-full ${
                  item.warning ? 'bg-[#D97706]' : 'bg-[#145A3A]'
                }`}
              />
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-[#0F1E16]"
                style={{ left: `${targetPct}%` }}
                title={`Minimum threshold: ${item.target} ${item.unit}`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const IrrigationWaterChart: React.FC<{ logs: IrrigationLog[] }> = ({ logs }) => {
  const maxLiters = Math.max(
    ...logs.map((l) => l.scheduledLiters + l.automatedPulseLiters),
    1
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#4A5D52]">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#145A3A] inline-block" />
            <span>Scheduled Baseline (L)</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#84CC16] inline-block" />
            <span>Automated Threshold Pulse (L)</span>
          </span>
        </div>
        <span className="font-mono-tabular">7-Day Simulated Water Usage</span>
      </div>

      <div className="h-44 flex items-end justify-between gap-2.5 pt-4 pb-1 px-2 bg-[#FAFBF9] rounded-xl border border-[#E4EBE6]">
        {logs.map((log) => {
          const schedPct = Math.round((log.scheduledLiters / maxLiters) * 100);
          const pulsePct = Math.round((log.automatedPulseLiters / maxLiters) * 100);
          const totalK = ((log.scheduledLiters + log.automatedPulseLiters) / 1000).toFixed(1);

          return (
            <div
              key={log.day}
              className="flex-1 flex flex-col items-center justify-end h-full gap-1 group"
            >
              <span className="text-[10px] font-mono-tabular text-[#4A5D52] group-hover:text-[#0F1E16] font-semibold">
                {totalK}k L
              </span>
              <div className="w-full max-w-[38px] h-28 bg-[#E9EFEA] rounded-t-md flex flex-col justify-end overflow-hidden">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${pulsePct}%` }}
                  transition={{ duration: 0.35 }}
                  className="w-full bg-[#84CC16]"
                  title={`Threshold-triggered pulse: ${log.automatedPulseLiters.toLocaleString()} L`}
                />
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${schedPct}%` }}
                  transition={{ duration: 0.35 }}
                  className="w-full bg-[#145A3A]"
                  title={`Scheduled irrigation: ${log.scheduledLiters.toLocaleString()} L`}
                />
              </div>
              <span className="text-[10px] font-mono-tabular text-[#4A5D52]">
                {log.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const FarmCropComparisonChart: React.FC<{
  farms: Farm[];
  crops: Crop[];
}> = ({ farms, crops }) => {
  const maxWater = Math.max(...crops.map((c) => c.dailyWaterLiters), 1);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Crop-Wise Moisture & Health Comparison */}
        <div className="p-4 rounded-xl bg-[#FAFBF9] border border-[#E4EBE6] space-y-3">
          <div className="text-xs font-bold text-[#0F1E16]">
            Crop-Wise Health Index & Moisture Balance
          </div>
          <div className="space-y-2.5">
            {crops.map((c) => (
              <div key={c.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#0F1E16] truncate">{c.name}</span>
                  <span className="font-mono-tabular text-[11px] text-[#4A5D52]">
                    Health: <strong className="text-[#145A3A]">{c.healthIndex}%</strong> · VWC:{' '}
                    <strong>{c.currentMoisture.toFixed(1)}%</strong>
                  </span>
                </div>
                <div className="h-2 w-full bg-[#E5EBE6] rounded-sm overflow-hidden flex">
                  <div
                    className={`h-full ${
                      c.healthIndex >= 85
                        ? 'bg-[#145A3A]'
                        : c.healthIndex >= 75
                        ? 'bg-[#84CC16]'
                        : 'bg-[#D97706]'
                    }`}
                    style={{ width: `${c.healthIndex}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Crop-Wise Simulated Daily Water Demand */}
        <div className="p-4 rounded-xl bg-[#FAFBF9] border border-[#E4EBE6] space-y-3">
          <div className="text-xs font-bold text-[#0F1E16]">
            Simulated Daily Water Allocation by Crop (Liters/day)
          </div>
          <div className="space-y-2.5">
            {crops.map((c) => {
              const farm = farms.find((f) => f.id === c.farmId);
              const pct = Math.round((c.dailyWaterLiters / maxWater) * 100);
              return (
                <div key={c.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#0F1E16] truncate">
                      {c.name.split(' ')[0]} ({farm?.code})
                    </span>
                    <span className="font-mono-tabular text-[11px] font-semibold text-[#145A3A]">
                      {c.dailyWaterLiters.toLocaleString()} L/d
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[#E5EBE6] rounded-sm overflow-hidden">
                    <div
                      className="h-full bg-[#237A4B]"
                      style={{ width: `${pct}%` }}
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
};

export const SensorToRecommendationPipeline: React.FC<{
  activeCropName: string;
  moisture: number;
  moistureMin: number;
  tempC: number;
  tempMax: number;
  onTriggerTest: () => void;
}> = ({ activeCropName, moisture, moistureMin, tempC, tempMax, onTriggerTest }) => {
  const isBreached = moisture < moistureMin || tempC > tempMax;

  const steps = [
    {
      step: '01. Field Sensor Node',
      icon: Cpu,
      title: `${activeCropName}`,
      metric: `VWC: ${moisture.toFixed(1)}% · Temp: ${tempC.toFixed(1)}°C`,
      detail: 'Sampled every 15m via simulated LoRaWAN node',
      active: true,
    },
    {
      step: '02. Threshold Rule Engine',
      icon: Sliders,
      title: isBreached ? 'Rule Violation Detected' : 'Within Nominal Bounds',
      metric: `Bounds: ≥${moistureMin}% VWC · ≤${tempMax}°C`,
      detail: 'Deterministic comparator in local React state',
      active: true,
    },
    {
      step: '03. Alert Classification',
      icon: Bell,
      title: isBreached ? 'Critical / Warning Alert' : 'No Active Alert',
      metric: isBreached ? 'Priority: Immediate Inspection' : 'Status: Nominal',
      detail: 'Logged to Alerts & Timeline queue',
      active: isBreached,
    },
    {
      step: '04. Prototype Advice',
      icon: CheckCircle2,
      title: isBreached ? 'Sample Drip Pulse Rule' : 'Continue Scheduled Cycle',
      metric: '[Demo Logic Only — Non-Prescriptive]',
      detail: 'Presented for operator acknowledgment',
      active: isBreached,
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-[#DCE4DF] p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-[#0F1E16]">
            Interactive Sensor-to-Alert-to-Recommendation Pipeline
          </h3>
          <p className="text-xs text-[#4A5D52]">
            Visualizes how simulated IoT readings evaluate against rules to trigger alerts and
            sample advice.
          </p>
        </div>
        <button
          onClick={onTriggerTest}
          className="px-3 py-1.5 text-xs font-semibold bg-[#145A3A] hover:bg-[#237A4B] text-white rounded-lg transition-colors cursor-pointer"
        >
          Test Pipeline with Simulated Spike
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={s.step}
              className={`relative p-4 rounded-xl border transition-all ${
                s.active && isBreached && idx >= 2
                  ? 'bg-[#FEF3C7]/45 border-[#D97706]'
                  : 'bg-[#FAFBF9] border-[#DCE4DF]'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-semibold text-[#145A3A]">
                <span>{s.step}</span>
                <Icon className="w-4 h-4 text-[#237A4B]" />
              </div>
              <div className="text-xs font-bold text-[#0F1E16] mt-2">{s.title}</div>
              <div className="text-xs font-mono-tabular font-semibold text-[#145A3A] mt-1">
                {s.metric}
              </div>
              <div className="text-[11px] text-[#4A5D52] mt-1">{s.detail}</div>
              {idx < 3 && (
                <ArrowRight className="hidden md:block w-4 h-4 text-[#94A89B] absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
