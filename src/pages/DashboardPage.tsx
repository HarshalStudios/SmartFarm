import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Droplets,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ArrowUpRight,
  Cpu,
  MapPin,
  Sprout,
  Compass,
  Clock,
  SlidersHorizontal,
  BatteryCharging,
  Wifi,
} from 'lucide-react';
import {
  ActivityEvent,
  Crop,
  Farm,
  FarmAlert,
  IoTDevice,
  IrrigationLog,
  LandPlot,
  PageId,
  TimeRange,
  UserProfile,
} from '../types/smartfarm';
import {
  TelemetryLineChart,
  PhEcRangeGauge,
  NpkBarChart,
  IrrigationWaterChart,
  FarmCropComparisonChart,
  SensorToRecommendationPipeline,
} from '../components/Charts';
import {
  AnimatedNumber,
  GrowthStageStepper,
  ResilientImage,
  SkeletonCard,
} from '../components/UiPrimitives';
import { VISUAL_ASSETS } from '../data/mockData';

interface DashboardPageProps {
  farms: Farm[];
  plots: LandPlot[];
  crops: Crop[];
  alerts: FarmAlert[];
  devices: IoTDevice[];
  irrigationLogs: IrrigationLog[];
  activityTimeline: ActivityEvent[];
  selectedFarmId: string;
  onSelectFarmId: (farmId: string) => void;
  timeRange: TimeRange;
  onSelectTimeRange: (range: TimeRange) => void;
  profile: UserProfile;
  onNavigate: (page: PageId) => void;
  onSelectCrop: (cropId: string) => void;
  onSimulateCropReading: (cropId: string, mode: 'normal' | 'stress') => void;
  onResolveAlert: (alertId: string, note?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  farms,
  plots,
  crops,
  alerts,
  devices,
  irrigationLogs,
  activityTimeline,
  selectedFarmId,
  onSelectFarmId,
  timeRange,
  onSelectTimeRange,
  profile,
  onNavigate,
  onSelectCrop,
  onSimulateCropReading,
  onResolveAlert,
}) => {
  const [chartCropId, setChartCropId] = useState<string>(crops[0]?.id || 'crop-1');
  const [chartMetric, setChartMetric] = useState<
    'moisture' | 'tempC' | 'humidity' | 'ph' | 'ecDsM'
  >('moisture');
  const [isSkeletonLoading, setIsSkeletonLoading] = useState(false);

  // Filter datasets by selectedFarmId if not 'ALL'
  const visibleFarms =
    selectedFarmId === 'ALL' ? farms : farms.filter((f) => f.id === selectedFarmId);
  const visiblePlots =
    selectedFarmId === 'ALL' ? plots : plots.filter((p) => p.farmId === selectedFarmId);
  const visibleCrops =
    selectedFarmId === 'ALL' ? crops : crops.filter((c) => c.farmId === selectedFarmId);
  const visibleDevices =
    selectedFarmId === 'ALL' ? devices : devices.filter((d) => d.farmId === selectedFarmId);
  const visibleAlerts =
    selectedFarmId === 'ALL' ? alerts : alerts.filter((a) => a.farmId === selectedFarmId);

  const selectedChartCrop =
    visibleCrops.find((c) => c.id === chartCropId) || visibleCrops[0] || crops[0];

  const totalCultivatedHa = visibleFarms.reduce((acc, f) => acc + f.cultivatedAreaHa, 0);
  const displayCultivatedArea =
    profile.areaUnit === 'acres' ? totalCultivatedHa * 2.47105 : totalCultivatedHa;

  const avgMoisture =
    visibleCrops.reduce((acc, c) => acc + c.currentMoisture, 0) /
    Math.max(visibleCrops.length, 1);

  const avgHealth =
    visibleCrops.reduce((acc, c) => acc + c.healthIndex, 0) /
    Math.max(visibleCrops.length, 1);

  const activeAlerts = visibleAlerts.filter((a) => !a.resolved);
  const onlineDevices = visibleDevices.filter((d) => d.status === 'Online').length;

  const triggerSimulatedRefresh = () => {
    setIsSkeletonLoading(true);
    setTimeout(() => {
      setIsSkeletonLoading(false);
    }, 320);
  };

  const activeHistory =
    timeRange === '7d' ? selectedChartCrop.history7d : selectedChartCrop.history;

  return (
    <div className="space-y-5">
      {/* Compact Responsive Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-xl border border-[#DCE4DF] p-4 sm:px-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#145A3A] font-semibold">
            <span>PRECISION AGRONOMY</span>
            <span aria-hidden="true">·</span>
            <span className="truncate">
              {selectedFarmId === 'ALL'
                ? 'All 3 Research Farms'
                : visibleFarms[0]?.name}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular">
              {timeRange === '24h' ? '24h Window' : '7d Trend'}
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-[#0F1E16] tracking-tight truncate">
            SmartFarm Command & Analytics Center
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={triggerSimulatedRefresh}
            className="px-2.5 py-1.5 text-xs font-semibold bg-[#F6F7F3] hover:bg-[#E8EFEA] text-[#0F1E16] border border-[#D5E0D9] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            Skeleton Demo
          </button>
          <button
            onClick={() => onSimulateCropReading(selectedChartCrop.id, 'normal')}
            className="px-3 py-1.5 text-xs font-semibold bg-[#145A3A] hover:bg-[#1D7049] text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Nominal Reading</span>
          </button>
          <button
            onClick={() => onSimulateCropReading(selectedChartCrop.id, 'stress')}
            className="px-3 py-1.5 text-xs font-semibold bg-[#B45309] hover:bg-[#92400E] text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Breach Test</span>
          </button>
        </div>
      </div>

      {/* 6 Responsive KPI Cards (2 cols on mobile, 3 cols on tablet/laptop, 6 cols on wide screens) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3.5">
        <motion.div
          whileHover={{ y: -2 }}
          onClick={() => onNavigate('farms')}
          className="bg-white rounded-xl border border-[#DCE4DF] p-3.5 sm:p-4 cursor-pointer hover:border-[#145A3A] transition-colors"
        >
          <div className="flex items-center justify-between text-[11px] font-medium text-[#4A5D52]">
            <span className="truncate">Monitored Farms</span>
            <MapPin className="w-3.5 h-3.5 text-[#145A3A] shrink-0" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-[#0F1E16] mt-1.5">
            <AnimatedNumber value={visibleFarms.length} /> Farms
          </div>
          <div className="text-[11px] text-[#4A5D52] mt-0.5 font-mono-tabular truncate">
            {visiblePlots.length} subdivided plots
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          onClick={() => onNavigate('farms')}
          className="bg-white rounded-xl border border-[#DCE4DF] p-3.5 sm:p-4 cursor-pointer hover:border-[#145A3A] transition-colors"
        >
          <div className="flex items-center justify-between text-[11px] font-medium text-[#4A5D52]">
            <span className="truncate">Cultivated Area</span>
            <Compass className="w-3.5 h-3.5 text-[#237A4B] shrink-0" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-[#0F1E16] mt-1.5">
            <AnimatedNumber
              value={displayCultivatedArea}
              decimals={1}
              suffix={profile.areaUnit === 'acres' ? ' ac' : ' ha'}
            />
          </div>
          <div className="text-[11px] text-[#4A5D52] mt-0.5 truncate">
            100% irrigated zones
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          onClick={() => onNavigate('devices')}
          className="bg-white rounded-xl border border-[#DCE4DF] p-3.5 sm:p-4 cursor-pointer hover:border-[#145A3A] transition-colors"
        >
          <div className="flex items-center justify-between text-[11px] font-medium text-[#4A5D52]">
            <span className="truncate">Active IoT Nodes</span>
            <Cpu className="w-3.5 h-3.5 text-[#145A3A] shrink-0" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-[#0F1E16] mt-1.5 font-mono-tabular">
            {onlineDevices} / {visibleDevices.length}
          </div>
          <div className="text-[11px] text-[#145A3A] font-semibold mt-0.5 truncate">
            98.9% mean uptime
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          onClick={() => {
            onSelectCrop(selectedChartCrop.id);
            onNavigate('crop-detail');
          }}
          className="bg-white rounded-xl border border-[#DCE4DF] p-3.5 sm:p-4 cursor-pointer hover:border-[#145A3A] transition-colors"
        >
          <div className="flex items-center justify-between text-[11px] font-medium text-[#4A5D52]">
            <span className="truncate">Soil Moisture</span>
            <Droplets className="w-3.5 h-3.5 text-[#145A3A] shrink-0" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-[#0F1E16] mt-1.5">
            <AnimatedNumber value={avgMoisture} decimals={1} suffix="%" />
          </div>
          <div className="text-[11px] text-[#4A5D52] mt-0.5 truncate">
            Root-zone VWC mean
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          onClick={() => onNavigate('crops')}
          className="bg-white rounded-xl border border-[#DCE4DF] p-3.5 sm:p-4 cursor-pointer hover:border-[#145A3A] transition-colors"
        >
          <div className="flex items-center justify-between text-[11px] font-medium text-[#4A5D52]">
            <span className="truncate">Crop Health</span>
            <Sprout className="w-3.5 h-3.5 text-[#65A30D] shrink-0" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-[#145A3A] mt-1.5">
            <AnimatedNumber value={avgHealth} decimals={0} suffix="%" />
          </div>
          <div className="text-[11px] text-[#4A5D52] mt-0.5 truncate">
            {visibleCrops.filter((c) => c.status === 'Optimal').length} of {visibleCrops.length}{' '}
            optimal
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          onClick={() => onNavigate('alerts')}
          className="bg-white rounded-xl border border-[#DCE4DF] p-3.5 sm:p-4 cursor-pointer hover:border-[#145A3A] transition-colors"
        >
          <div className="flex items-center justify-between text-[11px] font-medium text-[#4A5D52]">
            <span className="truncate">Active Alerts</span>
            <AlertTriangle
              className={`w-3.5 h-3.5 shrink-0 ${
                activeAlerts.length > 0 ? 'text-[#D97706]' : 'text-[#145A3A]'
              }`}
            />
          </div>
          <div
            className={`text-lg sm:text-xl font-bold mt-1.5 ${
              activeAlerts.length > 0 ? 'text-[#B45309]' : 'text-[#145A3A]'
            }`}
          >
            <AnimatedNumber value={activeAlerts.length} /> Active
          </div>
          <div className="text-[11px] text-[#145A3A] font-semibold mt-0.5 truncate">
            Inspect queue →
          </div>
        </motion.div>
      </div>

      {/* Visually Attractive Aerial Farm Section & Interactive Parcel Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#DCE4DF] overflow-hidden flex flex-col justify-between">
          <div className="relative h-64 sm:h-72 w-full overflow-hidden">
            <ResilientImage
              src={VISUAL_ASSETS.aerialHero}
              alt="Aerial view of SmartFarm precision agriculture plots and solar weather node"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />

            {/* Interactive Plot Pins on Aerial View */}
            {visiblePlots.map((plot) => {
              const plotCrop = crops.find((c) => c.id === plot.cropId);
              const isSelected = plotCrop?.id === selectedChartCrop.id;
              const isCrit = plotCrop?.status === 'Critical';
              return (
                <button
                  key={plot.id}
                  onClick={() => {
                    if (plotCrop) setChartCropId(plotCrop.id);
                  }}
                  style={{ left: `${plot.mapCoords.x}%`, top: `${plot.mapCoords.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg text-[11px] font-mono-tabular font-bold shadow-md transition-transform hover:scale-105 cursor-pointer ${
                    isSelected
                      ? 'bg-[#84CC16] text-[#092E1D] ring-2 ring-white'
                      : isCrit
                      ? 'bg-[#DC2626] text-white'
                      : 'bg-[#0F4C31]/90 text-white border border-white/40'
                  }`}
                  title={`${plot.code}: ${plotCrop?.name} (${plotCrop?.currentMoisture}% VWC)`}
                >
                  {plot.code} · {plotCrop?.currentMoisture.toFixed(0)}%
                </button>
              );
            })}

            <div className="absolute bottom-4 left-5 right-5 flex flex-wrap items-end justify-between gap-2 text-white">
              <div>
                <div className="text-[11px] font-semibold tracking-wider text-[#A3E635]">
                  INTERACTIVE FIELD PARCEL TELEMETRY MAP (CLICK ANY PLOT PIN)
                </div>
                <div className="text-base font-bold">
                  {selectedChartCrop.name} —{' '}
                  {plots.find((p) => p.id === selectedChartCrop.plotId)?.name}
                </div>
              </div>
              <button
                onClick={() => {
                  onSelectCrop(selectedChartCrop.id);
                  onNavigate('crop-detail');
                }}
                className="px-3 py-1.5 text-xs font-semibold bg-white/95 text-[#0F4C31] hover:bg-white rounded-lg transition-colors cursor-pointer"
              >
                Open Plot Sensor Console →
              </button>
            </div>
          </div>

          <div className="p-4 bg-[#FAFBF9] border-t border-[#E6ECE8] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-[#4A5D52]">Filter Farm View:</span>
              <button
                onClick={() => onSelectFarmId('ALL')}
                className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                  selectedFarmId === 'ALL'
                    ? 'bg-[#145A3A] text-white'
                    : 'bg-white border border-[#DCE4DF] text-[#4A5D52]'
                }`}
              >
                All Farms
              </button>
              {farms.map((f) => (
                <button
                  key={f.id}
                  onClick={() => onSelectFarmId(f.id)}
                  className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                    selectedFarmId === f.id
                      ? 'bg-[#145A3A] text-white'
                      : 'bg-white border border-[#DCE4DF] text-[#4A5D52]'
                  }`}
                >
                  {f.code}
                </button>
              ))}
            </div>
            <span className="font-mono-tabular text-[#4A5D52]">
              Soil: {plots.find((p) => p.id === selectedChartCrop.plotId)?.soilType}
            </span>
          </div>
        </div>

        {/* Right 5 Columns: Selected Crop Health & Growth-Stage Panel */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#DCE4DF] p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#145A3A]">
                SELECTED PARCEL CROP HEALTH & GROWTH STAGE
              </span>
              <span
                className={`text-xs font-bold ${
                  selectedChartCrop.status === 'Critical'
                    ? 'text-[#DC2626]'
                    : selectedChartCrop.status === 'Attention'
                    ? 'text-[#B45309]'
                    : 'text-[#145A3A]'
                }`}
              >
                {selectedChartCrop.status}
              </span>
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#0F1E16]">
                {selectedChartCrop.name}{' '}
                <span className="text-xs font-normal italic text-[#4A5D52]">
                  ({selectedChartCrop.scientificName})
                </span>
              </h2>
              <p className="text-xs text-[#4A5D52] mt-0.5">{selectedChartCrop.notes}</p>
            </div>

            <div className="pt-2">
              <GrowthStageStepper
                currentStage={selectedChartCrop.growthStage}
                progressPct={selectedChartCrop.stageProgressPct}
              />
            </div>

            {/* Key Live Sensor Strip */}
            <div className="grid grid-cols-3 gap-2.5 pt-2 text-xs font-mono-tabular">
              <div className="p-3 rounded-xl bg-[#F6F7F3] border border-[#E4EBE6]">
                <span className="font-sans text-[11px] text-[#4A5D52] block">Soil Moisture</span>
                <strong className="text-sm text-[#0F1E16]">
                  {selectedChartCrop.currentMoisture.toFixed(1)}%
                </strong>
              </div>
              <div className="p-3 rounded-xl bg-[#F6F7F3] border border-[#E4EBE6]">
                <span className="font-sans text-[11px] text-[#4A5D52] block">Soil / Air Temp</span>
                <strong className="text-sm text-[#0F1E16]">
                  {selectedChartCrop.currentSoilTempC.toFixed(1)}° /{' '}
                  {selectedChartCrop.currentTempC.toFixed(1)}°C
                </strong>
              </div>
              <div className="p-3 rounded-xl bg-[#F6F7F3] border border-[#E4EBE6]">
                <span className="font-sans text-[11px] text-[#4A5D52] block">pH & EC</span>
                <strong className="text-sm text-[#0F1E16]">
                  {selectedChartCrop.currentPh.toFixed(1)} · {selectedChartCrop.currentEcDsM} dS/m
                </strong>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E6ECE8] flex items-center justify-between text-xs">
            <span className="text-[#4A5D52] font-mono-tabular">
              Daily Irrigation: {selectedChartCrop.dailyWaterLiters.toLocaleString()} L/day
            </span>
            <button
              onClick={() => {
                onSelectCrop(selectedChartCrop.id);
                onNavigate('crop-detail');
              }}
              className="font-semibold text-[#145A3A] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Inspect Crop Analytics</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Prominent Soil & Canopy Monitoring Analytics Section */}
      {isSkeletonLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <SkeletonCard heightClass="h-96" />
          </div>
          <div className="lg:col-span-4">
            <SkeletonCard heightClass="h-96" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 8 Columns: Multi-Metric Time-Series Chart (24h & 7d) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-[#DCE4DF] p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E6ECE8]">
              <div>
                <h2 className="text-base font-bold text-[#0F1E16]">
                  Soil & Micro-Climate Telemetry Analytics ({timeRange.toUpperCase()})
                </h2>
                <p className="text-xs text-[#4A5D52]">
                  Explore 24-hour and 7-day trends with safe, caution, and critical range markers.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedChartCrop.id}
                  onChange={(e) => setChartCropId(e.target.value)}
                  aria-label="Select crop for telemetry chart"
                  className="px-3 py-1.5 text-xs font-semibold bg-[#F6F7F3] border border-[#D5E0D9] rounded-lg text-[#0F1E16] focus:outline-none focus:border-[#145A3A]"
                >
                  {crops.map((crop) => (
                    <option key={crop.id} value={crop.id}>
                      {crop.name}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-1 p-0.5 bg-[#F6F7F3] rounded-lg border border-[#D5E0D9]">
                  {(['24h', '7d'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => onSelectTimeRange(r)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                        timeRange === r
                          ? 'bg-[#145A3A] text-white'
                          : 'text-[#4A5D52] hover:text-[#0F1E16]'
                      }`}
                    >
                      {r === '24h' ? '24h' : '7d'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Metric Selector Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { key: 'moisture', label: 'Soil Moisture (%)' },
                  { key: 'tempC', label: 'Ambient & Soil Temp' },
                  { key: 'humidity', label: 'Air Humidity (%)' },
                  { key: 'ph', label: 'Root-Zone pH' },
                  { key: 'ecDsM', label: 'Conductivity (EC dS/m)' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setChartMetric(tab.key)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    chartMetric === tab.key
                      ? 'bg-[#0F4C31] text-white'
                      : 'bg-[#F6F7F3] text-[#4A5D52] hover:text-[#0F1E16]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <TelemetryLineChart
              history={activeHistory}
              metric={chartMetric}
              showSoilTempOverlay={chartMetric === 'tempC'}
              minThreshold={
                chartMetric === 'moisture'
                  ? selectedChartCrop.thresholds.moistureMin
                  : chartMetric === 'tempC'
                  ? selectedChartCrop.thresholds.tempMinC
                  : chartMetric === 'ph'
                  ? selectedChartCrop.thresholds.phMin
                  : chartMetric === 'ecDsM'
                  ? selectedChartCrop.thresholds.ecMin
                  : undefined
              }
              maxThreshold={
                chartMetric === 'moisture'
                  ? selectedChartCrop.thresholds.moistureMax
                  : chartMetric === 'tempC'
                  ? selectedChartCrop.thresholds.tempMaxC
                  : chartMetric === 'ph'
                  ? selectedChartCrop.thresholds.phMax
                  : chartMetric === 'ecDsM'
                  ? selectedChartCrop.thresholds.ecMax
                  : undefined
              }
              unit={
                chartMetric === 'moisture' || chartMetric === 'humidity'
                  ? '%'
                  : chartMetric === 'tempC'
                  ? `°${profile.tempUnit}`
                  : chartMetric === 'ph'
                  ? ' pH'
                  : ' dS/m'
              }
              label={`${selectedChartCrop.name} (${
                timeRange === '7d' ? '7-Day Daily Mean' : '24-Hour Interval'
              })`}
              tempUnit={profile.tempUnit}
            />
          </div>

          {/* Right 4 Columns: pH & EC Safe/Caution/Critical Range Gauges + NPK */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-[#DCE4DF] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E6ECE8] pb-3">
                <div>
                  <h3 className="text-sm font-bold text-[#0F1E16]">
                    pH & Electrical Conductivity Ranges
                  </h3>
                  <p className="text-xs text-[#4A5D52]">
                    Safe, Caution, and Critical root-zone bands
                  </p>
                </div>
                <SlidersHorizontal className="w-4 h-4 text-[#145A3A]" />
              </div>

              <PhEcRangeGauge
                ph={selectedChartCrop.currentPh}
                phMin={selectedChartCrop.thresholds.phMin}
                phMax={selectedChartCrop.thresholds.phMax}
                ecDsM={selectedChartCrop.currentEcDsM}
                ecMin={selectedChartCrop.thresholds.ecMin}
                ecMax={selectedChartCrop.thresholds.ecMax}
              />
            </div>

            <div className="bg-white rounded-2xl border border-[#DCE4DF] p-5 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[#0F1E16]">
                  NPK Macronutrient Balance — {selectedChartCrop.name.split(' ')[0]}
                </h3>
                <p className="text-xs text-[#4A5D52]">
                  Simulated soil analyzer reading vs crop minimum threshold
                </p>
              </div>
              <NpkBarChart
                nitrogen={selectedChartCrop.nitrogenMgKg}
                phosphorus={selectedChartCrop.phosphorusMgKg}
                potassium={selectedChartCrop.potassiumMgKg}
                nitrogenMin={selectedChartCrop.thresholds.nitrogenMin}
              />
            </div>
          </div>
        </div>
      )}

      {/* Visual Sensor -> Rule -> Alert -> Recommendation Flow */}
      <SensorToRecommendationPipeline
        activeCropName={selectedChartCrop.name}
        moisture={selectedChartCrop.currentMoisture}
        moistureMin={selectedChartCrop.thresholds.moistureMin}
        tempC={selectedChartCrop.currentTempC}
        tempMax={selectedChartCrop.thresholds.tempMaxC}
        onTriggerTest={() => onSimulateCropReading(selectedChartCrop.id, 'stress')}
      />

      {/* Irrigation Analytics + Farm/Crop Comparisons */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#DCE4DF] p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-[#0F1E16]">
              Irrigation History & Simulated Water Usage
            </h2>
            <p className="text-xs text-[#4A5D52]">
              Scheduled drip/sprinkler baseline vs automated threshold-triggered water pulses.
            </p>
          </div>
          <IrrigationWaterChart logs={irrigationLogs} />
        </div>

        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#DCE4DF] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#0F1E16]">
                Farm-Wise & Crop-Wise Comparative Analytics
              </h2>
              <p className="text-xs text-[#4A5D52]">
                Side-by-side comparison of crop health index, moisture, and daily water budget.
              </p>
            </div>
          </div>
          <FarmCropComparisonChart farms={farms} crops={visibleCrops} />
        </div>
      </div>

      {/* Bottom 3-Column Section: Alert Priority + Recommendations + Device Health & Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Alert Priority & Recommendations Panel (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#DCE4DF] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E6ECE8] pb-3">
            <div>
              <h2 className="text-base font-bold text-[#0F1E16]">
                Alert Priority & Prototype Recommendations
              </h2>
              <p className="text-xs text-[#4A5D52]">
                Sample rule outputs (non-validated demo advice only)
              </p>
            </div>
            <button
              onClick={() => onNavigate('alerts')}
              className="text-xs font-semibold text-[#145A3A] hover:underline cursor-pointer"
            >
              Open All ({activeAlerts.length})
            </button>
          </div>

          {activeAlerts.length === 0 ? (
            <div className="p-4 rounded-xl bg-[#F6F7F3] text-xs text-[#4A5D52] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#145A3A]" />
              <span>All monitored plots are operating within safe threshold bands.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {activeAlerts.slice(0, 3).map((alert) => (
                <div
                  key={alert.id}
                  className="p-3.5 rounded-xl bg-[#FAFBF9] border border-[#DCE4DF] space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={`font-bold ${
                        alert.severity === 'Critical'
                          ? 'text-[#DC2626]'
                          : alert.severity === 'Warning'
                          ? 'text-[#B45309]'
                          : 'text-[#145A3A]'
                      }`}
                    >
                      {alert.severity}: {alert.parameter} ({alert.measuredValue})
                    </span>
                    <span className="font-mono-tabular text-[11px] text-[#4A5D52]">
                      {alert.timestamp.split(' ')[1] || alert.timestamp}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-[#0F1E16]">
                    {alert.cropName} · {alert.plotName}
                  </div>
                  <p className="text-[11px] text-[#4A5D52] leading-relaxed">
                    {alert.prototypeAdvice}
                  </p>
                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[10px] font-mono-tabular text-[#5A6D62]">
                      {alert.ruleTriggered}
                    </span>
                    <button
                      onClick={() =>
                        onResolveAlert(alert.id, 'Acknowledged from Command Center.')
                      }
                      className="text-xs font-semibold text-[#145A3A] hover:underline cursor-pointer"
                    >
                      Mark Resolved
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Device Connectivity & Battery Health (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-[#DCE4DF] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E6ECE8] pb-3">
            <div>
              <h2 className="text-base font-bold text-[#0F1E16]">
                IoT Node Uptime & Battery Health
              </h2>
              <p className="text-xs text-[#4A5D52]">
                Simulated LoRaWAN & Wi-Fi sensor status
              </p>
            </div>
            <button
              onClick={() => onNavigate('devices')}
              className="text-xs font-semibold text-[#145A3A] hover:underline cursor-pointer"
            >
              Manage →
            </button>
          </div>

          <div className="space-y-3">
            {visibleDevices.slice(0, 5).map((dev) => (
              <div
                key={dev.id}
                className="p-3 rounded-xl bg-[#FAFBF9] border border-[#E4EBE6] flex items-center justify-between gap-2 text-xs"
              >
                <div className="min-w-0">
                  <div className="font-semibold text-[#0F1E16] truncate">{dev.name}</div>
                  <div className="text-[11px] font-mono-tabular text-[#4A5D52]">
                    {dev.deviceCode} · Uptime {dev.uptimePct}%
                  </div>
                </div>
                <div className="text-right shrink-0 font-mono-tabular">
                  <div
                    className={`font-bold flex items-center justify-end gap-1 ${
                      dev.batteryPct <= 25 ? 'text-[#B45309]' : 'text-[#145A3A]'
                    }`}
                  >
                    <BatteryCharging className="w-3.5 h-3.5" />
                    <span>{dev.batteryPct}%</span>
                  </div>
                  <div className="text-[10px] text-[#4A5D52] flex items-center justify-end gap-1">
                    <Wifi className="w-3 h-3" />
                    <span>{dev.signalRssi} dBm</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Timeline (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-[#DCE4DF] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E6ECE8] pb-3">
            <div>
              <h2 className="text-base font-bold text-[#0F1E16]">
                Recent Activity Timeline
              </h2>
              <p className="text-xs text-[#4A5D52]">Live session audit log</p>
            </div>
            <Clock className="w-4 h-4 text-[#145A3A]" />
          </div>

          <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
            {activityTimeline.slice(0, 6).map((ev) => (
              <div
                key={ev.id}
                className="pb-3 border-b border-[#E8EFEA] last:border-none space-y-1 text-xs"
              >
                <div className="flex items-center justify-between text-[11px] text-[#4A5D52]">
                  <span className="font-semibold uppercase text-[#145A3A]">
                    {ev.category}
                  </span>
                  <span className="font-mono-tabular">{ev.timestamp}</span>
                </div>
                <div className="font-semibold text-[#0F1E16]">{ev.title}</div>
                <div className="text-[11px] text-[#4A5D52] leading-relaxed">
                  {ev.detail}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
