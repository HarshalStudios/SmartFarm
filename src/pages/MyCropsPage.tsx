import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Search,
  Plus,
  ArrowUpRight,
  X,
  Droplets,
  Sprout,
  AlertCircle,
} from 'lucide-react';
import { Crop, Farm, LandPlot, PageId, UserProfile } from '../types/smartfarm';
import { GrowthStageStepper } from '../components/UiPrimitives';

interface MyCropsPageProps {
  crops: Crop[];
  farms: Farm[];
  plots: LandPlot[];
  profile: UserProfile;
  onSelectCrop: (cropId: string) => void;
  onNavigate: (page: PageId) => void;
  onAddCrop: (newCrop: Omit<Crop, 'id' | 'history' | 'history7d' | 'status'>) => void;
}

export const MyCropsPage: React.FC<MyCropsPageProps> = ({
  crops,
  farms,
  plots,
  profile,
  onSelectCrop,
  onNavigate,
  onAddCrop,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // New crop form state
  const [name, setName] = useState('');
  const [scientificName, setScientificName] = useState('');
  const [variety, setVariety] = useState('');
  const [category, setCategory] = useState<Crop['category']>('Vegetables');
  const [farmId, setFarmId] = useState(farms[0]?.id || 'farm-1');
  const [plotId, setPlotId] = useState(plots[0]?.id || 'plot-101');
  const [growthStage, setGrowthStage] = useState<Crop['growthStage']>('Vegetative');
  const [moistureMin, setMoistureMin] = useState(45);
  const [moistureMax, setMoistureMax] = useState(70);

  const categories = [
    'All',
    'Vegetables',
    'Cereals & Grains',
    'Orchard & Plantation',
    'Leafy Greens',
  ];

  const statuses = ['All', 'Optimal', 'Attention', 'Critical'];

  const filteredCrops = crops.filter((crop) => {
    const matchesSearch =
      crop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crop.variety.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crop.scientificName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || crop.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || crop.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const displayTemp = (tempC: number) =>
    profile.tempUnit === 'F'
      ? `${((tempC * 9) / 5 + 32).toFixed(1)}°F`
      : `${tempC.toFixed(1)}°C`;

  const handleCreateCrop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Please provide a crop common name.');
      return;
    }
    if (moistureMin >= moistureMax) {
      setFormError('Minimum moisture threshold must be lower than maximum moisture threshold.');
      return;
    }

    setFormError(null);
    onAddCrop({
      name: name.trim(),
      scientificName: scientificName.trim() || 'Cultivar sp. (Demo)',
      variety: variety.trim() || 'Standard Campus Hybrid',
      category,
      farmId,
      plotId,
      plantedDate: '2026-09-25',
      expectedHarvestDate: '2026-12-10',
      growthStage,
      stageProgressPct: growthStage === 'Seedling' ? 20 : growthStage === 'Vegetative' ? 45 : 65,
      healthIndex: 92,
      currentMoisture: Math.round((moistureMin + moistureMax) / 2),
      currentTempC: 24.5,
      currentSoilTempC: 21.2,
      currentHumidity: 68,
      currentPh: 6.4,
      currentEcDsM: 1.7,
      nitrogenMgKg: 130,
      phosphorusMgKg: 55,
      potassiumMgKg: 170,
      dailyWaterLiters: 8200,
      thresholds: {
        moistureMin: Number(moistureMin),
        moistureMax: Number(moistureMax),
        tempMinC: 16,
        tempMaxC: 30,
        phMin: 5.8,
        phMax: 6.8,
        ecMin: 1.2,
        ecMax: 2.4,
        nitrogenMin: 110,
      },
      notes: 'Added during interactive demo session.',
    });

    setName('');
    setScientificName('');
    setVariety('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-2xl border border-[#DCE4DF] p-5 lg:p-6">
        <div>
          <div className="text-xs font-bold text-[#145A3A]">
            CULTIVAR REGISTRY & GROWTH STAGE TELEMETRY
          </div>
          <h1 className="text-2xl font-bold text-[#0F1E16] tracking-tight mt-0.5">
            My Crops Catalogue ({filteredCrops.length})
          </h1>
          <p className="text-xs text-[#4A5D52] mt-0.5">
            Search, filter, or select any crop card to inspect 24h/7d sensor analytics and
            threshold rules.
          </p>
        </div>

        <button
          onClick={() => {
            setFormError(null);
            setShowAddModal(true);
          }}
          className="px-4 py-2.5 text-xs font-semibold bg-[#0F4C31] hover:bg-[#145A3A] text-white rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4 text-[#A3E635]" />
          <span>Add Demo Crop Planting</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-[#DCE4DF] p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#4A5D52] absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by crop name, scientific name, or variety..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#F6F7F3] border border-[#C5D6CC] rounded-xl focus:bg-white focus:outline-none focus:border-[#145A3A]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-[#F6F7F3] rounded-xl border border-[#DCE4DF] overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-[#0F4C31] text-white'
                    : 'text-[#4A5D52] hover:text-[#0F1E16]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 p-1 bg-[#F6F7F3] rounded-xl border border-[#DCE4DF]">
            {statuses.map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#1D7049] text-white'
                    : 'text-[#4A5D52] hover:text-[#0F1E16]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Crop Cards Grid */}
      {filteredCrops.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#DCE4DF] p-10 text-center space-y-3">
          <Sprout className="w-8 h-8 text-[#145A3A] mx-auto" />
          <div className="text-sm font-bold text-[#0F1E16]">
            No crops match your current search or filter criteria.
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setCategoryFilter('All');
              setStatusFilter('All');
            }}
            className="px-4 py-2 text-xs font-semibold bg-[#145A3A] text-white rounded-xl cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCrops.map((crop) => {
            const farm = farms.find((f) => f.id === crop.farmId);
            const plot = plots.find((p) => p.id === crop.plotId);
            const moistureOut =
              crop.currentMoisture < crop.thresholds.moistureMin ||
              crop.currentMoisture > crop.thresholds.moistureMax;

            return (
              <motion.div
                key={crop.id}
                whileHover={{ y: -3 }}
                onClick={() => {
                  onSelectCrop(crop.id);
                  onNavigate('crop-detail');
                }}
                className="bg-white rounded-2xl border border-[#DCE4DF] hover:border-[#145A3A] p-5 flex flex-col justify-between transition-all cursor-pointer group shadow-2xs"
              >
                <div className="space-y-4">
                  {/* Quiet Metadata Row */}
                  <div className="flex items-center justify-between text-xs text-[#4A5D52]">
                    <span>
                      {crop.category} · Health Index{' '}
                      <strong className="font-mono-tabular text-[#145A3A]">
                        {crop.healthIndex}%
                      </strong>
                    </span>
                    <span
                      className={`font-bold ${
                        crop.status === 'Critical'
                          ? 'text-[#DC2626]'
                          : crop.status === 'Attention'
                          ? 'text-[#B45309]'
                          : 'text-[#145A3A]'
                      }`}
                    >
                      {crop.status}
                    </span>
                  </div>

                  {/* Crop Title & Scientific Name */}
                  <div>
                    <h2 className="text-lg font-bold text-[#0F1E16] group-hover:text-[#145A3A] transition-colors">
                      {crop.name}
                    </h2>
                    <div className="text-xs text-[#4A5D52] italic">
                      {crop.scientificName} — {crop.variety}
                    </div>
                    <div className="text-xs text-[#4A5D52] mt-1">
                      Parcel: <strong className="text-[#0F1E16]">{plot?.code}</strong> (
                      {farm?.name})
                    </div>
                  </div>

                  {/* 5-Stage Growth Progress Indicator */}
                  <div className="pt-2 border-t border-[#E6ECE8]">
                    <GrowthStageStepper
                      currentStage={crop.growthStage}
                      progressPct={crop.stageProgressPct}
                      compact
                    />
                  </div>

                  {/* Telemetry Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-[#E6ECE8] text-xs font-mono-tabular">
                    <div className="p-2.5 rounded-xl bg-[#F6F7F3]">
                      <span className="text-[#4A5D52] font-sans block text-[10px]">
                        Soil Moisture (VWC)
                      </span>
                      <span
                        className={`font-bold text-sm ${
                          moistureOut ? 'text-[#DC2626]' : 'text-[#0F1E16]'
                        }`}
                      >
                        {crop.currentMoisture.toFixed(1)}%
                      </span>{' '}
                      <span className="text-[10px] text-[#4A5D52]">
                        ({crop.thresholds.moistureMin}–{crop.thresholds.moistureMax}%)
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#F6F7F3]">
                      <span className="text-[#4A5D52] font-sans block text-[10px]">
                        Air / Soil Temp
                      </span>
                      <span className="font-bold text-sm text-[#0F1E16]">
                        {displayTemp(crop.currentTempC)}
                      </span>{' '}
                      <span className="text-[10px] text-[#4A5D52]">
                        / {crop.currentSoilTempC.toFixed(0)}°C
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#F6F7F3]">
                      <span className="text-[#4A5D52] font-sans block text-[10px]">
                        pH & Conductivity
                      </span>
                      <span className="font-bold text-[#0F1E16]">
                        {crop.currentPh.toFixed(1)} pH · {crop.currentEcDsM} dS/m
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#F6F7F3]">
                      <span className="text-[#4A5D52] font-sans block text-[10px]">
                        NPK (mg/kg)
                      </span>
                      <span className="font-bold text-[#0F1E16]">
                        {crop.nitrogenMgKg}/{crop.phosphorusMgKg}/{crop.potassiumMgKg}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-4 pt-3 border-t border-[#E6ECE8] flex items-center justify-between text-xs">
                  <span className="text-[#4A5D52] font-mono-tabular flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-[#145A3A]" />
                    <span>{crop.dailyWaterLiters.toLocaleString()} L/d</span>
                  </span>
                  <span className="font-semibold text-[#145A3A] flex items-center gap-1 group-hover:underline">
                    <span>Open Sensor Analytics</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Crop Modal with Validation */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-[#DCE4DF] max-w-lg w-full p-6 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-[#E6ECE8] pb-3">
              <h3 className="text-base font-bold text-[#0F1E16]">
                Add Demo Crop Planting (Local State)
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-[#4A5D52] hover:text-[#0F1E16] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#DC2626] text-xs text-[#B91C1C] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateCrop} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#0F1E16] mb-1">
                    Crop Common Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hybrid Okra"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-[#C5D6CC] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#0F1E16] mb-1">
                    Variety / Cultivar
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Arka Anamika (Demo)"
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                    className="w-full px-3 py-2 border border-[#C5D6CC] rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#0F1E16] mb-1">
                    Scientific Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Abelmoschus esculentus"
                    value={scientificName}
                    onChange={(e) => setScientificName(e.target.value)}
                    className="w-full px-3 py-2 border border-[#C5D6CC] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#0F1E16] mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Crop['category'])}
                    className="w-full px-3 py-2 border border-[#C5D6CC] rounded-xl bg-white"
                  >
                    <option value="Vegetables">Vegetables</option>
                    <option value="Cereals & Grains">Cereals & Grains</option>
                    <option value="Orchard & Plantation">Orchard & Plantation</option>
                    <option value="Leafy Greens">Leafy Greens</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#0F1E16] mb-1">Assigned Farm</label>
                  <select
                    value={farmId}
                    onChange={(e) => setFarmId(e.target.value)}
                    className="w-full px-3 py-2 border border-[#C5D6CC] rounded-xl bg-white"
                  >
                    {farms.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-[#0F1E16] mb-1">Assigned Plot</label>
                  <select
                    value={plotId}
                    onChange={(e) => setPlotId(e.target.value)}
                    className="w-full px-3 py-2 border border-[#C5D6CC] rounded-xl bg-white"
                  >
                    {plots.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.code} — {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-[#0F1E16] mb-1">Growth Stage</label>
                  <select
                    value={growthStage}
                    onChange={(e) => setGrowthStage(e.target.value as Crop['growthStage'])}
                    className="w-full px-3 py-2 border border-[#C5D6CC] rounded-xl bg-white"
                  >
                    <option value="Seedling">Seedling</option>
                    <option value="Vegetative">Vegetative</option>
                    <option value="Flowering">Flowering</option>
                    <option value="Fruiting / Grain Fill">Fruiting / Grain Fill</option>
                    <option value="Maturation">Maturation</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-[#0F1E16] mb-1">
                    Min Moisture (%)
                  </label>
                  <input
                    type="number"
                    value={moistureMin}
                    onChange={(e) => setMoistureMin(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-[#C5D6CC] rounded-xl font-mono-tabular"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#0F1E16] mb-1">
                    Max Moisture (%)
                  </label>
                  <input
                    type="number"
                    value={moistureMax}
                    onChange={(e) => setMoistureMax(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-[#C5D6CC] rounded-xl font-mono-tabular"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E6ECE8]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-[#4A5D52] hover:text-[#0F1E16] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-[#0F4C31] hover:bg-[#145A3A] text-white rounded-xl cursor-pointer"
                >
                  Save Crop Planting
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
