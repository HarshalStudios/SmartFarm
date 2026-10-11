import React from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Cpu,
  Activity,
  Bell,
  Sprout,
  MapPin,
  RefreshCw,
  Sliders,
  BarChart3,
  UserCheck,
} from 'lucide-react';
import { Crop, Farm, FarmAlert, IoTDevice, PageId, UserProfile } from '../types/smartfarm';
import { AnimatedNumber, ResilientImage } from '../components/UiPrimitives';
import { SensorToRecommendationPipeline } from '../components/Charts';
import { VISUAL_ASSETS } from '../data/mockData';

interface OverviewPageProps {
  farms: Farm[];
  crops: Crop[];
  devices: IoTDevice[];
  alerts: FarmAlert[];
  profile: UserProfile;
  onNavigate: (page: PageId) => void;
  onSelectCrop: (cropId: string) => void;
  onSimulateGlobal: () => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  farms,
  crops,
  devices,
  alerts,
  profile,
  onNavigate,
  onSelectCrop,
  onSimulateGlobal,
}) => {
  const unresolvedAlerts = alerts.filter((a) => !a.resolved).length;
  const onlineDevices = devices.filter((d) => d.status === 'Online').length;
  const totalArea = farms.reduce((acc, f) => acc + f.cultivatedAreaHa, 0);
  const featuredCrop = crops[0];

  return (
    <div className="space-y-8">
      {/* Split Hero Section with Aerial Precision Farm Imagery */}
      <section className="bg-white rounded-2xl border border-[#DCE4DF] overflow-hidden shadow-2xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="text-xs font-bold tracking-wider text-[#145A3A]">
                COLLEGE CAPSTONE DEMONSTRATION · PRECISION AGRONOMY SAAS PROTOTYPE
              </div>
              <h1
                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0F1E16] tracking-tight leading-tight"
                style={{ textWrap: 'balance' }}
              >
                SmartFarm — Smart IoT-Based Precision Farming
              </h1>
              <p className="text-sm lg:text-base text-[#4A5D52] leading-relaxed max-w-2xl">
                A complete precision-agriculture analytics and farm-management frontend prototype.
                Monitor simulated soil moisture, root-zone pH, electrical conductivity, and NPK
                macronutrients across subdivided farm parcels—complete with configurable threshold
                rules and automated demo alerts.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('dashboard')}
                className="px-5 py-3 bg-[#0F4C31] hover:bg-[#145A3A] text-white text-sm font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Launch Analytics Dashboard</span>
                <ArrowRight className="w-4 h-4 text-[#A3E635]" />
              </button>
              <button
                onClick={onSimulateGlobal}
                className="px-4 py-3 bg-[#F6F7F3] hover:bg-[#E8EFEA] text-[#0F4C31] border border-[#C5D6CC] text-sm font-semibold rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Simulate Live Reading</span>
              </button>
              <button
                onClick={() => onNavigate('login')}
                className="px-4 py-3 text-xs font-semibold text-[#4A5D52] hover:text-[#0F1E16] flex items-center gap-1.5 cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-[#145A3A]" />
                <span>Switch Demo Persona</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 relative min-h-[260px] lg:min-h-full overflow-hidden">
            <ResilientImage
              src={VISUAL_ASSETS.aerialHero}
              alt="Aerial view of SmartFarm precision agriculture research fields and solar telemetry node"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 text-white space-y-1">
              <div className="text-[11px] font-mono-tabular text-[#A3E635] font-semibold">
                DEMO TELEMETRY TESTBED · 100% FRONTEND STATE
              </div>
              <div className="text-sm font-bold">
                GreenValley, Highland Terrace & Controlled Polyhouse Sites
              </div>
              <div className="text-xs text-white/80">
                Presenter: {profile.fullName} · Advisor: {profile.advisorName}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Quantitative KPI Strip */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#DCE4DF]">
          <div className="text-xs font-medium text-[#4A5D52]">Research Farms & Area</div>
          <div className="text-2xl font-bold text-[#0F1E16] mt-1">
            <AnimatedNumber value={farms.length} /> Farms ·{' '}
            <AnimatedNumber value={totalArea} decimals={1} suffix=" ha" />
          </div>
          <div className="text-xs text-[#4A5D52] mt-1.5">
            Subsurface drip, sprinkler, and mist zones
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#DCE4DF]">
          <div className="text-xs font-medium text-[#4A5D52]">Monitored Crop Plantings</div>
          <div className="text-2xl font-bold text-[#0F1E16] mt-1">
            <AnimatedNumber value={crops.length} /> Active Cultivars
          </div>
          <div className="text-xs text-[#145A3A] font-semibold mt-1.5">
            24-hour & 7-day multi-parameter curves
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#DCE4DF]">
          <div className="text-xs font-medium text-[#4A5D52]">Simulated IoT Field Nodes</div>
          <div className="text-2xl font-bold text-[#0F1E16] font-mono-tabular mt-1">
            {onlineDevices} / {devices.length} Online
          </div>
          <div className="text-xs text-[#4A5D52] mt-1.5">
            Capacitance, NPK/pH, weather & valve nodes
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#DCE4DF]">
          <div className="text-xs font-medium text-[#4A5D52]">Active Threshold Alerts</div>
          <div
            className={`text-2xl font-bold mt-1 ${
              unresolvedAlerts > 0 ? 'text-[#B45309]' : 'text-[#145A3A]'
            }`}
          >
            <AnimatedNumber value={unresolvedAlerts} /> Unresolved
          </div>
          <div className="text-xs text-[#4A5D52] mt-1.5">
            {alerts.filter((a) => a.resolved).length} resolved during session
          </div>
        </div>
      </section>

      {/* Interactive System Workflow Illustration */}
      {featuredCrop && (
        <SensorToRecommendationPipeline
          activeCropName={featuredCrop.name}
          moisture={featuredCrop.currentMoisture}
          moistureMin={featuredCrop.thresholds.moistureMin}
          tempC={featuredCrop.currentTempC}
          tempMax={featuredCrop.thresholds.tempMaxC}
          onTriggerTest={onSimulateGlobal}
        />
      )}

      {/* Professor Evaluation Module Directory */}
      <section className="bg-white rounded-2xl border border-[#DCE4DF] p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E6ECE8] pb-4">
          <div>
            <h2 className="text-lg font-bold text-[#0F1E16]">
              Professor Evaluation Guide — Explore All 10 Interactive Modules
            </h2>
            <p className="text-xs text-[#4A5D52] mt-0.5">
              Every card below links directly to a live working module backed by shared React
              state.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              page: 'dashboard' as PageId,
              title: '01. Analytics Command Center',
              desc: 'Interactive parcel map, 6 animated KPIs, 24h/7d soil & temp trends, pH/EC range gauges, and water usage.',
              icon: Activity,
            },
            {
              page: 'crops' as PageId,
              title: '02. Visual Crop Catalogue',
              desc: 'Search and filter crops, inspect 5-stage growth steppers, or add a new demo planting.',
              icon: Sprout,
            },
            {
              page: 'crop-detail' as PageId,
              title: '03. Crop Sensor & Threshold Tuner',
              desc: 'Deep-dive per-crop telemetry, historical vs current comparison, and live threshold rule editor.',
              icon: Sliders,
            },
            {
              page: 'alerts' as PageId,
              title: '04. Alerts & Sample Advice',
              desc: 'Filter by severity, inspect rule triggers, and resolve alerts with field technician notes.',
              icon: Bell,
            },
            {
              page: 'alert-patterns' as PageId,
              title: '05. Alert Patterns & Rule Pipeline',
              desc: 'Analyze anomaly frequency by sensor parameter, time-of-day distribution, and rule simulation.',
              icon: BarChart3,
            },
            {
              page: 'farms' as PageId,
              title: '06. Farms, Parcels & IoT Hardware',
              desc: 'Add/edit farms, land parcels, and IoT sensor nodes with form validation and live simulators.',
              icon: MapPin,
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <motion.button
                key={card.title}
                whileHover={{ y: -2 }}
                onClick={() => {
                  if (card.page === 'crop-detail') {
                    onSelectCrop(crops[0]?.id || 'crop-1');
                  }
                  onNavigate(card.page);
                }}
                className="text-left p-5 rounded-xl border border-[#DCE4DF] hover:border-[#145A3A] bg-[#FAFBF9] hover:bg-white transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#0F1E16] group-hover:text-[#145A3A]">
                    {card.title}
                  </span>
                  <Icon className="w-4 h-4 text-[#237A4B]" />
                </div>
                <p className="text-xs text-[#4A5D52] mt-2 leading-relaxed">{card.desc}</p>
              </motion.button>
            );
          })}
        </div>
      </section>
    </div>
  );
};
