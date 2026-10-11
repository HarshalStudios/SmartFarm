import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  Sliders,
  CheckCircle2,
  Bell,
} from 'lucide-react';
import {
  Crop,
  CropThresholds,
  Farm,
  FarmAlert,
  LandPlot,
  PageId,
  TimeRange,
  UserProfile,
} from '../types/smartfarm';
import {
  TelemetryLineChart,
  PhEcRangeGauge,
  NpkBarChart,
} from '../components/Charts';
import {
  GrowthStageStepper,
  ResilientImage,
} from '../components/UiPrimitives';
import { VISUAL_ASSETS } from '../data/mockData';

interface CropDetailPageProps {
  crops: Crop[];
  selectedCropId: string;
  farms: Farm[];
  plots: LandPlot[];
  alerts: FarmAlert[];
  timeRange: TimeRange;
  onSelectTimeRange: (range: TimeRange) => void;
  profile: UserProfile;
  onSelectCrop: (cropId: string) => void;
  onNavigate: (page: PageId) => void;
  onSimulateCropReading: (cropId: string, mode: 'normal' | 'stress') => void;
  onUpdateCropThresholds: (cropId: string, thresholds: CropThresholds) => void;
  onResolveAlert: (alertId: string, note?: string) => void;
}

export const CropDetailPage: React.FC<CropDetailPageProps> = ({
  crops,
  selectedCropId,
  farms,
  plots,
  alerts,
  timeRange,
  onSelectTimeRange,
  profile,
  onSelectCrop,
  onNavigate,
  onSimulateCropReading,
  onUpdateCropThresholds,
  onResolveAlert,
}) => {
  const crop = crops.find((c) => c.id === selectedCropId) || crops[0];
  const farm = farms.find((f) => f.id === crop.farmId);
  const plot = plots.find((p) => p.id === crop.plotId);
  const cropAlerts = alerts.filter((a) => a.cropId === crop.id);

  const [activeMetric, setActiveMetric] = useState<
    'moisture' | 'tempC' | 'humidity' | 'ph' | 'ecDsM'
  >('moisture');
  const [thresholdsForm, setThresholdsForm] = useState<CropThresholds>(crop.thresholds);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  useEffect(() => {
    setThresholdsForm(crop.thresholds);
  }, [crop.id, crop.thresholds]);

  const displayTemp = (tempC: number) =>
    profile.tempUnit === 'F'
      ? `${((tempC * 9) / 5 + 32).toFixed(1)}°F`
      : `${tempC.toFixed(1)}°C`;

  const handleSaveThresholds = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCropThresholds(crop.id, thresholdsForm);
    setSavedNotice('Thresholds updated in local state & evaluated against live readings.');
    setTimeout(() => setSavedNotice(null), 3500);
  };

  const activeHistory = timeRange === '7d' ? crop.history7d : crop.history;

  return (
    <div className="space-y-6">
      {/* Top Bar: Back Button + Crop Switcher + Simulation Triggers */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-2xl border border-[#DCE4DF] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate('crops')}
            className="px-3 py-1.5 text-xs font-semibold bg-[#F6F7F3] border border-[#DCE4DF] hover:border-[#145A3A] rounded-xl flex items-center gap-1.5 text-[#0F1E16] cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Crop Catalogue</span>
          </button>

          <div className="flex items-center gap-2">
            <label htmlFor="crop-switcher" className="text-xs font-semibold text-[#4A5D52]">
              Active Cultivar:
            </label>
            <select
              id="crop-switcher"
              value={crop.id}
              onChange={(e) => onSelectCrop(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold bg-[#F6F7F3] border border-[#145A3A] rounded-xl text-[#0F4C31]"
            >
              {crops.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Simulation Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onSimulateCropReading(crop.id, 'normal')}
            className="px-3.5 py-2 text-xs font-semibold bg-[#0F4C31] hover:bg-[#145A3A] text-white rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#A3E635]" />
            <span>Simulate Nominal Reading</span>
          </button>
          <button
            onClick={() => onSimulateCropReading(crop.id, 'stress')}
            className="px-3.5 py-2 text-xs font-semibold bg-[#B45309] hover:bg-[#92400E] text-white rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Simulate Stress Reading (Trigger Alert)</span>
          </button>
        </div>
      </div>

      {/* Crop Header + Soil Sensor Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 bg-white rounded-2xl border border-[#DCE4DF] p-6 flex flex-col justify-between space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E6ECE8] pb-4">
            <div>
              <div className="text-xs text-[#4A5D52]">
                {crop.category} · Planted {crop.plantedDate} · Expected Harvest{' '}
                {crop.expectedHarvestDate}
              </div>
              <h1 className="text-2xl font-bold text-[#0F1E16] mt-1">
                {crop.name}{' '}
                <span className="text-sm font-normal text-[#4A5D52] italic">
                  ({crop.scientificName})
                </span>
              </h1>
              <div className="text-xs text-[#4A5D52] mt-1">
                Variety: <strong className="text-[#0F1E16]">{crop.variety}</strong> · Parcel:{' '}
                <strong className="text-[#0F1E16]">{plot?.name}</strong> ({farm?.name})
              </div>
            </div>

            <div className="flex items-center gap-5 text-xs">
              <div>
                <span className="text-[#4A5D52] block">Health Index</span>
                <strong className="text-base font-mono-tabular text-[#145A3A]">
                  {crop.healthIndex}%
                </strong>
              </div>
              <div>
                <span className="text-[#4A5D52] block">Telemetry Status</span>
                <strong
                  className={`text-base ${
                    crop.status === 'Critical'
                      ? 'text-[#DC2626]'
                      : crop.status === 'Attention'
                      ? 'text-[#B45309]'
                      : 'text-[#145A3A]'
                  }`}
                >
                  {crop.status}
                </strong>
              </div>
            </div>
          </div>

          <GrowthStageStepper
            currentStage={crop.growthStage}
            progressPct={crop.stageProgressPct}
          />

          {/* 5 Live Readout Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 font-mono-tabular">
            <div className="p-3 rounded-xl bg-[#F6F7F3] border border-[#E4EBE6]">
              <div className="text-[11px] font-sans text-[#4A5D52]">Soil Moisture</div>
              <div
                className={`text-lg font-bold mt-0.5 ${
                  crop.currentMoisture < crop.thresholds.moistureMin ||
                  crop.currentMoisture > crop.thresholds.moistureMax
                    ? 'text-[#DC2626]'
                    : 'text-[#0F1E16]'
                }`}
              >
                {crop.currentMoisture.toFixed(1)}%
              </div>
              <div className="text-[10px] text-[#4A5D52]">
                {crop.thresholds.moistureMin}–{crop.thresholds.moistureMax}%
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#F6F7F3] border border-[#E4EBE6]">
              <div className="text-[11px] font-sans text-[#4A5D52]">Canopy / Soil Temp</div>
              <div className="text-lg font-bold text-[#0F1E16] mt-0.5">
                {displayTemp(crop.currentTempC)}
              </div>
              <div className="text-[10px] text-[#4A5D52]">
                Soil: {displayTemp(crop.currentSoilTempC)}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#F6F7F3] border border-[#E4EBE6]">
              <div className="text-[11px] font-sans text-[#4A5D52]">Air Humidity</div>
              <div className="text-lg font-bold text-[#0F1E16] mt-0.5">
                {crop.currentHumidity}%
              </div>
              <div className="text-[10px] text-[#4A5D52]">Canopy VPD node</div>
            </div>

            <div className="p-3 rounded-xl bg-[#F6F7F3] border border-[#E4EBE6]">
              <div className="text-[11px] font-sans text-[#4A5D52]">Root-Zone pH</div>
              <div className="text-lg font-bold text-[#0F1E16] mt-0.5">
                {crop.currentPh.toFixed(1)} pH
              </div>
              <div className="text-[10px] text-[#4A5D52]">
                {crop.thresholds.phMin}–{crop.thresholds.phMax} pH
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#F6F7F3] border border-[#E4EBE6]">
              <div className="text-[11px] font-sans text-[#4A5D52]">Soil EC</div>
              <div className="text-lg font-bold text-[#0F1E16] mt-0.5">
                {crop.currentEcDsM.toFixed(1)} dS/m
              </div>
              <div className="text-[10px] text-[#4A5D52]">
                {crop.thresholds.ecMin}–{crop.thresholds.ecMax} dS/m
              </div>
            </div>
          </div>
        </div>

        {/* Right 4 Columns: Root-Zone Probe Showcase Card */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-[#DCE4DF] overflow-hidden flex flex-col justify-between">
          <div className="relative h-48 lg:h-full min-h-[190px] w-full overflow-hidden">
            <ResilientImage
              src={VISUAL_ASSETS.soilSensor}
              alt="Multi-depth capacitance and NPK soil sensor probe in cultivated crop bed"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
              <div className="text-[10px] font-mono-tabular text-[#A3E635] font-bold">
                SIMULATED HARDWARE PROBE · {plot?.code}
              </div>
              <div className="text-sm font-bold">
                Multi-Depth Capacitance & NPK/EC Root Analyzer
              </div>
              <div className="text-[11px] text-white/80">
                Irrigation: {plot?.irrigationType} · {crop.dailyWaterLiters.toLocaleString()} L/d
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Analytics Chart + Configurable Thresholds Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl border border-[#DCE4DF] p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E6ECE8]">
              <div className="flex flex-wrap items-center gap-1.5">
                {(
                  [
                    { key: 'moisture', label: 'Soil Moisture' },
                    { key: 'tempC', label: 'Air & Soil Temp' },
                    { key: 'humidity', label: 'Humidity' },
                    { key: 'ph', label: 'Soil pH' },
                    { key: 'ecDsM', label: 'Conductivity (EC)' },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setActiveMetric(t.key)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      activeMetric === t.key
                        ? 'bg-[#0F4C31] text-white'
                        : 'bg-[#F6F7F3] text-[#4A5D52] hover:text-[#0F1E16]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

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

            <TelemetryLineChart
              history={activeHistory}
              metric={activeMetric}
              showSoilTempOverlay={activeMetric === 'tempC'}
              minThreshold={
                activeMetric === 'moisture'
                  ? crop.thresholds.moistureMin
                  : activeMetric === 'tempC'
                  ? crop.thresholds.tempMinC
                  : activeMetric === 'ph'
                  ? crop.thresholds.phMin
                  : activeMetric === 'ecDsM'
                  ? crop.thresholds.ecMin
                  : undefined
              }
              maxThreshold={
                activeMetric === 'moisture'
                  ? crop.thresholds.moistureMax
                  : activeMetric === 'tempC'
                  ? crop.thresholds.tempMaxC
                  : activeMetric === 'ph'
                  ? crop.thresholds.phMax
                  : activeMetric === 'ecDsM'
                  ? crop.thresholds.ecMax
                  : undefined
              }
              unit={
                activeMetric === 'moisture' || activeMetric === 'humidity'
                  ? '%'
                  : activeMetric === 'tempC'
                  ? `°${profile.tempUnit}`
                  : activeMetric === 'ph'
                  ? ' pH'
                  : ' dS/m'
              }
              label={`${crop.name} — ${
                timeRange === '7d' ? '7-Day Trend' : '24-Hour Interval'
              }`}
              tempUnit={profile.tempUnit}
            />
          </div>

          {/* pH/EC Safe Range + NPK Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-[#DCE4DF] p-5 space-y-4">
              <h3 className="text-sm font-bold text-[#0F1E16]">
                Root-Zone pH & EC Safe/Caution/Critical Spectrum
              </h3>
              <PhEcRangeGauge
                ph={crop.currentPh}
                phMin={crop.thresholds.phMin}
                phMax={crop.thresholds.phMax}
                ecDsM={crop.currentEcDsM}
                ecMin={crop.thresholds.ecMin}
                ecMax={crop.thresholds.ecMax}
              />
            </div>

            <div className="bg-white rounded-2xl border border-[#DCE4DF] p-5 space-y-4">
              <h3 className="text-sm font-bold text-[#0F1E16]">
                Soil NPK Macronutrient Comparison (mg/kg)
              </h3>
              <NpkBarChart
                nitrogen={crop.nitrogenMgKg}
                phosphorus={crop.phosphorusMgKg}
                potassium={crop.potassiumMgKg}
                nitrogenMin={crop.thresholds.nitrogenMin}
              />
            </div>
          </div>
        </div>

        {/* Right 4 Columns: Threshold Configurator & Related Alerts */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-[#DCE4DF] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E6ECE8] pb-3">
              <div>
                <h2 className="text-base font-bold text-[#0F1E16]">
                  Configurable Alert Thresholds
                </h2>
                <p className="text-xs text-[#4A5D52]">
                  Modify limits to test dynamic alert generation
                </p>
              </div>
              <Sliders className="w-4 h-4 text-[#145A3A]" />
            </div>

            {savedNotice && (
              <div className="p-3 rounded-xl bg-[#E8F3EC] border border-[#237A4B] text-xs text-[#0F4C31] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{savedNotice}</span>
              </div>
            )}

            <form onSubmit={handleSaveThresholds} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#0F1E16] mb-1">
                    Min Moisture (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={thresholdsForm.moistureMin}
                    onChange={(e) =>
                      setThresholdsForm({
                        ...thresholdsForm,
                        moistureMin: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-[#C5D6CC] rounded-xl font-mono-tabular"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#0F1E16] mb-1">
                    Max Moisture (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={thresholdsForm.moistureMax}
                    onChange={(e) =>
                      setThresholdsForm({
                        ...thresholdsForm,
                        moistureMax: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-[#C5D6CC] rounded-xl font-mono-tabular"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#0F1E16] mb-1">
                    Min Temp (°C)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={thresholdsForm.tempMinC}
                    onChange={(e) =>
                      setThresholdsForm({
                        ...thresholdsForm,
                        tempMinC: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-[#C5D6CC] rounded-xl font-mono-tabular"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#0F1E16] mb-1">
                    Max Temp (°C)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={thresholdsForm.tempMaxC}
                    onChange={(e) =>
                      setThresholdsForm({
                        ...thresholdsForm,
                        tempMaxC: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-[#C5D6CC] rounded-xl font-mono-tabular"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#0F1E16] mb-1">Min pH</label>
                  <input
                    type="number"
                    step="0.1"
                    value={thresholdsForm.phMin}
                    onChange={(e) =>
                      setThresholdsForm({
                        ...thresholdsForm,
                        phMin: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-[#C5D6CC] rounded-xl font-mono-tabular"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#0F1E16] mb-1">Max pH</label>
                  <input
                    type="number"
                    step="0.1"
                    value={thresholdsForm.phMax}
                    onChange={(e) =>
                      setThresholdsForm({
                        ...thresholdsForm,
                        phMax: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-[#C5D6CC] rounded-xl font-mono-tabular"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#0F1E16] mb-1">
                  Min Soil Nitrogen (mg/kg)
                </label>
                <input
                  type="number"
                  step="1"
                  value={thresholdsForm.nitrogenMin}
                  onChange={(e) =>
                    setThresholdsForm({
                      ...thresholdsForm,
                      nitrogenMin: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-[#C5D6CC] rounded-xl font-mono-tabular"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#0F4C31] hover:bg-[#145A3A] text-white font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Save & Re-Evaluate Thresholds
              </button>
            </form>
          </div>

          {/* Related Alerts for this Crop */}
          <div className="bg-white rounded-2xl border border-[#DCE4DF] p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#E6ECE8] pb-2.5">
              <span className="text-sm font-bold text-[#0F1E16] flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-[#145A3A]" />
                <span>Related Crop Alerts ({cropAlerts.length})</span>
              </span>
            </div>
            {cropAlerts.length === 0 ? (
              <div className="text-xs text-[#4A5D52] py-2">
                No alerts recorded for {crop.name}.
              </div>
            ) : (
              <div className="space-y-2.5">
                {cropAlerts.slice(0, 3).map((a) => (
                  <div
                    key={a.id}
                    className="p-3 rounded-xl bg-[#FAFBF9] border border-[#E4EBE6] text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-bold ${
                          a.severity === 'Critical' ? 'text-[#DC2626]' : 'text-[#B45309]'
                        }`}
                      >
                        {a.severity}: {a.parameter}
                      </span>
                      <span className="font-mono-tabular text-[#4A5D52]">
                        {a.measuredValue}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#4A5D52]">{a.message}</p>
                    {!a.resolved && (
                      <button
                        onClick={() => onResolveAlert(a.id, 'Resolved from Crop Detail view.')}
                        className="text-[11px] font-semibold text-[#145A3A] hover:underline cursor-pointer"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Historical Sensor Log Table */}
      <div className="bg-white rounded-2xl border border-[#DCE4DF] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E6ECE8]">
          <h2 className="text-base font-bold text-[#0F1E16]">
            Historical & Simulated Sensor Log — {crop.name}
          </h2>
          <p className="text-xs text-[#4A5D52]">
            Showing {activeHistory.length} intervals ({timeRange.toUpperCase()} window).
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E6ECE8] bg-[#FAFBF9] text-[11px] font-semibold text-[#4A5D52]">
                <th className="py-3 px-4">Interval</th>
                <th className="py-3 px-4">Source / Scenario</th>
                <th className="py-3 px-4 text-right">Moisture (%)</th>
                <th className="py-3 px-4 text-right">Canopy / Soil Temp</th>
                <th className="py-3 px-4 text-right">Humidity (%)</th>
                <th className="py-3 px-4 text-right">pH & EC</th>
                <th className="py-3 px-4 text-right">N / P / K (mg/kg)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6ECE8] text-xs font-mono-tabular">
              {[...activeHistory].reverse().map((reading) => (
                <tr key={reading.id} className="hover:bg-[#F6F7F3]">
                  <td className="py-2.5 px-4 font-semibold text-[#0F1E16]">
                    {reading.timestamp}
                  </td>
                  <td className="py-2.5 px-4 font-sans text-[#4A5D52]">
                    {reading.isSimulated
                      ? `Simulated (${reading.scenarioLabel || 'Interactive'})`
                      : 'Demo Baseline Telemetry'}
                  </td>
                  <td className="py-2.5 px-4 text-right font-semibold text-[#0F1E16]">
                    {reading.moisture.toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-4 text-right text-[#0F1E16]">
                    {displayTemp(reading.tempC)} / {displayTemp(reading.soilTempC)}
                  </td>
                  <td className="py-2.5 px-4 text-right text-[#0F1E16]">
                    {reading.humidity}%
                  </td>
                  <td className="py-2.5 px-4 text-right text-[#0F1E16]">
                    {reading.ph.toFixed(1)} · {reading.ecDsM.toFixed(1)} dS/m
                  </td>
                  <td className="py-2.5 px-4 text-right text-[#0F1E16]">
                    {reading.nitrogen} / {reading.phosphorus} / {reading.potassium}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
