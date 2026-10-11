import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Edit3, MapPin, Layers, X, Droplets, AlertCircle } from 'lucide-react';
import { Crop, Farm, LandPlot, PageId, UserProfile } from '../types/smartfarm';

interface FarmsLandsPageProps {
  farms: Farm[];
  plots: LandPlot[];
  crops: Crop[];
  profile: UserProfile;
  onSaveFarm: (farm: Farm) => void;
  onSavePlot: (plot: LandPlot) => void;
  onSelectCrop: (cropId: string) => void;
  onNavigate: (page: PageId) => void;
}

export const FarmsLandsPage: React.FC<FarmsLandsPageProps> = ({
  farms,
  plots,
  crops,
  profile,
  onSaveFarm,
  onSavePlot,
  onSelectCrop,
  onNavigate,
}) => {
  const [selectedFarmFilter, setSelectedFarmFilter] = useState<string>('ALL');

  // Farm Modal State
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
  const [isFarmModalOpen, setIsFarmModalOpen] = useState(false);
  const [farmFormError, setFarmFormError] = useState<string | null>(null);

  // Plot Modal State
  const [editingPlot, setEditingPlot] = useState<LandPlot | null>(null);
  const [isPlotModalOpen, setIsPlotModalOpen] = useState(false);
  const [plotFormError, setPlotFormError] = useState<string | null>(null);

  const formatArea = (ha: number) =>
    profile.areaUnit === 'acres'
      ? `${(ha * 2.47105).toFixed(1)} acres`
      : `${ha.toFixed(1)} ha`;

  const maxFarmArea = Math.max(...farms.map((f) => f.totalAreaHa), 1);

  const openAddFarm = () => {
    setFarmFormError(null);
    setEditingFarm({
      id: `farm-${Date.now()}`,
      name: '',
      code: `SF-${farms.length + 1}`,
      location: 'Campus Demonstration Block (Demo)',
      totalAreaHa: 5.0,
      cultivatedAreaHa: 4.5,
      soilType: 'Sandy Clay Loam',
      waterSource: 'Solar Drip Reservoir',
      dailyWaterBudgetLiters: 16500,
      establishedYear: 2026,
      manager: profile.fullName,
      notes: 'Added via interactive Farm Management CRUD.',
    });
    setIsFarmModalOpen(true);
  };

  const openEditFarm = (farm: Farm) => {
    setFarmFormError(null);
    setEditingFarm({ ...farm });
    setIsFarmModalOpen(true);
  };

  const handleFarmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFarm || !editingFarm.name.trim()) {
      setFarmFormError('Farm name is required.');
      return;
    }
    if (editingFarm.totalAreaHa <= 0) {
      setFarmFormError('Total farm area must be greater than 0.');
      return;
    }
    onSaveFarm({
      ...editingFarm,
      cultivatedAreaHa: Math.min(editingFarm.cultivatedAreaHa, editingFarm.totalAreaHa),
    });
    setIsFarmModalOpen(false);
    setEditingFarm(null);
  };

  const openAddPlot = () => {
    setPlotFormError(null);
    setEditingPlot({
      id: `plot-${Date.now()}`,
      farmId: farms[0]?.id || 'farm-1',
      name: '',
      code: `PL-${plots.length + 101}`,
      areaHa: 2.5,
      soilType: 'Alluvial Loam',
      irrigationType: 'Subsurface Drip',
      cropId: crops[0]?.id || 'crop-1',
      elevationM: 210,
      mapCoords: { x: 45, y: 50 },
    });
    setIsPlotModalOpen(true);
  };

  const openEditPlot = (plot: LandPlot) => {
    setPlotFormError(null);
    setEditingPlot({ ...plot });
    setIsPlotModalOpen(true);
  };

  const handlePlotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlot || !editingPlot.name.trim()) {
      setPlotFormError('Plot name is required.');
      return;
    }
    if (editingPlot.areaHa <= 0) {
      setPlotFormError('Plot area must be greater than 0.');
      return;
    }
    onSavePlot(editingPlot);
    setIsPlotModalOpen(false);
    setEditingPlot(null);
  };

  const filteredPlots =
    selectedFarmFilter === 'ALL'
      ? plots
      : plots.filter((p) => p.farmId === selectedFarmFilter);

  return (
    <div className="space-y-7">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-2xl border border-[#DCE4DF] p-5 lg:p-6">
        <div>
          <div className="text-xs font-bold text-[#145A3A]">
            FARM PARCELS, AREA COMPARISONS & IRRIGATION ZONES
          </div>
          <h1 className="text-2xl font-bold text-[#0F1E16] tracking-tight mt-0.5">
            Farms & Subdivided Land Plots
          </h1>
          <p className="text-xs text-[#4A5D52] mt-0.5">
            Compare farm area and water budgets, or add and edit parcels in local React state.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={openAddFarm}
            className="px-4 py-2 text-xs font-semibold bg-[#0F4C31] hover:bg-[#145A3A] text-white rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#A3E635]" />
            <span>Add Research Farm</span>
          </button>
          <button
            onClick={openAddPlot}
            className="px-4 py-2 text-xs font-semibold bg-[#F6F7F3] border border-[#145A3A] text-[#0F4C31] hover:bg-[#E8EFEA] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Land Parcel</span>
          </button>
        </div>
      </div>

      {/* Farm-Wise Area & Water Allocation Comparison Bar */}
      <div className="bg-white rounded-2xl border border-[#DCE4DF] p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-[#0F1E16]">
              Farm-Wise Cultivated Area & Water Budget Comparison
            </h2>
            <p className="text-xs text-[#4A5D52]">
              Proportional scale across all registered research farms
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {farms.map((farm) => {
            const pct = Math.round((farm.totalAreaHa / maxFarmArea) * 100);
            const plotCount = plots.filter((p) => p.farmId === farm.id).length;
            return (
              <div
                key={farm.id}
                className="p-4 rounded-xl bg-[#FAFBF9] border border-[#E4EBE6] space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#0F1E16]">{farm.name}</span>
                  <span className="font-mono-tabular font-semibold text-[#145A3A]">
                    {formatArea(farm.totalAreaHa)}
                  </span>
                </div>
                <div className="h-2.5 w-full bg-[#E5EBE6] rounded-sm overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.35 }}
                    className="h-full bg-[#145A3A]"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#4A5D52] font-mono-tabular">
                  <span>{plotCount} subdivided plots</span>
                  <span className="flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-[#237A4B]" />
                    {farm.dailyWaterBudgetLiters.toLocaleString()} L/d
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Farms Cards Grid */}
      <section className="space-y-4">
        <h2 className="text-base font-bold text-[#0F1E16] flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#145A3A]" />
          <span>Registered Research Farms ({farms.length})</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {farms.map((farm) => {
            const farmPlotCount = plots.filter((p) => p.farmId === farm.id).length;
            return (
              <motion.div
                key={farm.id}
                whileHover={{ y: -2 }}
                className="bg-white rounded-2xl border border-[#DCE4DF] p-5 flex flex-col justify-between space-y-4 shadow-2xs"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#4A5D52]">
                    <span className="font-mono-tabular font-bold text-[#145A3A]">
                      {farm.code} · Est. {farm.establishedYear}
                    </span>
                    <button
                      onClick={() => openEditFarm(farm)}
                      className="text-[#145A3A] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Farm</span>
                    </button>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#0F1E16]">{farm.name}</h3>
                    <div className="text-xs text-[#4A5D52] mt-0.5">{farm.location}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-[#E6ECE8] text-xs">
                    <div className="p-2.5 rounded-xl bg-[#F6F7F3]">
                      <span className="text-[#4A5D52] block text-[10px]">Total / Cultivated</span>
                      <strong className="font-mono-tabular text-[#0F1E16]">
                        {formatArea(farm.totalAreaHa)}
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#F6F7F3]">
                      <span className="text-[#4A5D52] block text-[10px]">Parcels & Water</span>
                      <strong className="font-mono-tabular text-[#0F1E16]">
                        {farmPlotCount} Plots · {(farm.dailyWaterBudgetLiters / 1000).toFixed(1)}k L
                      </strong>
                    </div>
                    <div className="col-span-2 text-xs">
                      <span className="text-[#4A5D52] block text-[11px]">
                        Soil Profile & Water Source
                      </span>
                      <span className="text-[#0F1E16] font-medium">
                        {farm.soilType} · {farm.waterSource}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#4A5D52] leading-relaxed">{farm.notes}</p>
                </div>

                <div className="pt-3 border-t border-[#E6ECE8] flex items-center justify-between text-xs">
                  <span className="text-[#4A5D52] truncate">Lead: {farm.manager}</span>
                  <button
                    onClick={() =>
                      setSelectedFarmFilter(
                        selectedFarmFilter === farm.id ? 'ALL' : farm.id
                      )
                    }
                    className="font-semibold text-[#145A3A] hover:underline whitespace-nowrap cursor-pointer"
                  >
                    {selectedFarmFilter === farm.id ? 'Show All Parcels' : 'Filter Parcels →'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Subdivided Land Plots Table */}
      <section className="bg-white rounded-2xl border border-[#DCE4DF] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E6ECE8] flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-[#0F1E16] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#237A4B]" />
              <span>Subdivided Land Parcels & Irrigation Zones ({filteredPlots.length})</span>
            </h2>
            <p className="text-xs text-[#4A5D52]">
              Each parcel is linked to a primary crop cultivar and irrigation delivery method.
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-[#F6F7F3] rounded-xl border border-[#DCE4DF]">
            <button
              onClick={() => setSelectedFarmFilter('ALL')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                selectedFarmFilter === 'ALL'
                  ? 'bg-[#0F4C31] text-white'
                  : 'text-[#4A5D52] hover:text-[#0F1E16]'
              }`}
            >
              All Farms
            </button>
            {farms.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFarmFilter(f.id)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  selectedFarmFilter === f.id
                    ? 'bg-[#0F4C31] text-white'
                    : 'text-[#4A5D52] hover:text-[#0F1E16]'
                }`}
              >
                {f.code}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E6ECE8] bg-[#FAFBF9] text-[11px] font-semibold text-[#4A5D52]">
                <th className="py-3 px-4">Parcel Code & Name</th>
                <th className="py-3 px-4">Parent Farm</th>
                <th className="py-3 px-4 text-right">Area</th>
                <th className="py-3 px-4">Soil & Irrigation System</th>
                <th className="py-3 px-4">Assigned Cultivar</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6ECE8] text-xs">
              {filteredPlots.map((plot) => {
                const farm = farms.find((f) => f.id === plot.farmId);
                const crop = crops.find((c) => c.id === plot.cropId);
                return (
                  <tr key={plot.id} className="hover:bg-[#F6F7F3]">
                    <td className="py-3 px-4">
                      <span className="font-mono-tabular font-bold text-[#145A3A]">
                        {plot.code}
                      </span>{' '}
                      · <strong className="text-[#0F1E16]">{plot.name}</strong>
                    </td>
                    <td className="py-3 px-4 text-[#4A5D52]">{farm?.name || 'Farm'}</td>
                    <td className="py-3 px-4 text-right font-mono-tabular font-semibold text-[#0F1E16]">
                      {formatArea(plot.areaHa)}
                    </td>
                    <td className="py-3 px-4 text-[#4A5D52]">
                      {plot.soilType} · {plot.irrigationType}
                    </td>
                    <td className="py-3 px-4">
                      {crop ? (
                        <button
                          onClick={() => {
                            onSelectCrop(crop.id);
                            onNavigate('crop-detail');
                          }}
                          className="font-semibold text-[#145A3A] hover:underline cursor-pointer"
                        >
                          {crop.name} ({crop.currentMoisture.toFixed(0)}% VWC)
                        </button>
                      ) : (
                        <span className="text-[#4A5D52]">Fallow</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => openEditPlot(plot)}
                        className="text-xs font-semibold text-[#145A3A] hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Parcel</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Farm Add/Edit Modal */}
      {isFarmModalOpen && editingFarm && (
        <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#DCE4DF] max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E6ECE8] pb-3">
              <h3 className="text-base font-bold text-[#0F1E16]">
                {farms.some((f) => f.id === editingFarm.id)
                  ? 'Edit Research Farm'
                  : 'Add Research Farm'}
              </h3>
              <button
                onClick={() => setIsFarmModalOpen(false)}
                className="p-1 text-[#4A5D52] hover:text-[#0F1E16] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {farmFormError && (
              <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#DC2626] text-xs text-[#B91C1C] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{farmFormError}</span>
              </div>
            )}

            <form onSubmit={handleFarmSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-medium text-[#0F1E16] mb-1">Farm Name *</label>
                  <input
                    type="text"
                    required
                    value={editingFarm.name}
                    onChange={(e) =>
                      setEditingFarm({ ...editingFarm, name: e.target.value })
                    }
                    placeholder="e.g. South Agronomy Experimental Block"
                    className="w-full px-3 py-2 border border-[#C5D6CC] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#0F1E16] mb-1">Farm Code</label>
                  <input
                    type="text"
                    required
                    value={editingFarm.code}
                    onChange={(e) =>
                      setEditingFarm({ ...editingFarm, code: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-[#C5D6CC] rounded-xl font-mono-tabular"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#0F1E16] mb-1">Location</label>
                  <input
                    type="text"
                    value={editingFarm.location}
                    onChange={(e) =>
                      setEditingFarm({ ...editingFarm, location: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-[#C5D6CC] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#0F1E16] mb-1">
                    Total Area (Hectares)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingFarm.totalAreaHa}
                    onChange={(e) =>
                      setEditingFarm({
                        ...editingFarm,
                        totalAreaHa: Number(e.target.value),
                        cultivatedAreaHa: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-[#C5D6CC] rounded-xl font-mono-tabular"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#0F1E16] mb-1">Soil Type</label>
                  <input
                    type="text"
                    value={editingFarm.soilType}
                    onChange={(e) =>
                      setEditingFarm({ ...editingFarm, soilType: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-[#C5D6CC] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#0F1E16] mb-1">Water Source</label>
                  <input
                    type="text"
                    value={editingFarm.waterSource}
                    onChange={(e) =>
                      setEditingFarm({ ...editingFarm, waterSource: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-[#C5D6CC] rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#0F1E16] mb-1">Manager / Lead</label>
                <input
                  type="text"
                  value={editingFarm.manager}
                  onChange={(e) =>
                    setEditingFarm({ ...editingFarm, manager: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#C5D6CC] rounded-xl"
                />
              </div>

              <div>
                <label className="block font-medium text-[#0F1E16] mb-1">Notes</label>
                <input
                  type="text"
                  value={editingFarm.notes}
                  onChange={(e) =>
                    setEditingFarm({ ...editingFarm, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#C5D6CC] rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E6ECE8]">
                <button
                  type="button"
                  onClick={() => setIsFarmModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#4A5D52] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-[#0F4C31] hover:bg-[#145A3A] text-white rounded-xl cursor-pointer"
                >
                  Save Farm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Land Plot Add/Edit Modal */}
      {isPlotModalOpen && editingPlot && (
        <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#DCE4DF] max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E6ECE8] pb-3">
              <h3 className="text-base font-bold text-[#0F1E16]">
                {plots.some((p) => p.id === editingPlot.id)
                  ? 'Edit Land Parcel'
                  : 'Add Land Parcel'}
              </h3>
              <button
                onClick={() => setIsPlotModalOpen(false)}
                className="p-1 text-[#4A5D52] hover:text-[#0F1E16] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {plotFormError && (
              <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#DC2626] text-xs text-[#B91C1C] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{plotFormError}</span>
              </div>
            )}

            <form onSubmit={handlePlotSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-medium text-[#0F1E16] mb-1">Parcel Name *</label>
                  <input
                    type="text"
                    required
                    value={editingPlot.name}
                    onChange={(e) =>
                      setEditingPlot({ ...editingPlot, name: e.target.value })
                    }
                    placeholder="e.g. East Block D4 — Pulse Trial"
                    className="w-full px-3 py-2 border border-[#C5D6CC] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#0F1E16] mb-1">Parcel Code</label>
                  <input
                    type="text"
                    required
                    value={editingPlot.code}
                    onChange={(e) =>
                      setEditingPlot({ ...editingPlot, code: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-[#C5D6CC] rounded-xl font-mono-tabular"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#0F1E16] mb-1">Parent Farm</label>
                  <select
                    value={editingPlot.farmId}
                    onChange={(e) =>
                      setEditingPlot({ ...editingPlot, farmId: e.target.value })
                    }
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
                  <label className="block font-medium text-[#0F1E16] mb-1">Assigned Crop</label>
                  <select
                    value={editingPlot.cropId}
                    onChange={(e) =>
                      setEditingPlot({ ...editingPlot, cropId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-[#C5D6CC] rounded-xl bg-white"
                  >
                    {crops.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-[#0F1E16] mb-1">Area (Ha)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingPlot.areaHa}
                    onChange={(e) =>
                      setEditingPlot({
                        ...editingPlot,
                        areaHa: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-[#C5D6CC] rounded-xl font-mono-tabular"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#0F1E16] mb-1">Soil Type</label>
                  <input
                    type="text"
                    value={editingPlot.soilType}
                    onChange={(e) =>
                      setEditingPlot({ ...editingPlot, soilType: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-[#C5D6CC] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#0F1E16] mb-1">Irrigation</label>
                  <select
                    value={editingPlot.irrigationType}
                    onChange={(e) =>
                      setEditingPlot({
                        ...editingPlot,
                        irrigationType: e.target.value as LandPlot['irrigationType'],
                      })
                    }
                    className="w-full px-3 py-2 border border-[#C5D6CC] rounded-xl bg-white"
                  >
                    <option value="Subsurface Drip">Subsurface Drip</option>
                    <option value="Overhead Sprinkler">Overhead Sprinkler</option>
                    <option value="Furrow / Flood">Furrow / Flood</option>
                    <option value="Precision Mist">Precision Mist</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E6ECE8]">
                <button
                  type="button"
                  onClick={() => setIsPlotModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#4A5D52] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-[#0F4C31] hover:bg-[#145A3A] text-white rounded-xl cursor-pointer"
                >
                  Save Parcel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
