import React, { useState } from 'react';
import {
  Cpu,
  Plus,
  Edit3,
  RefreshCw,
  Search,
  X,
  BatteryCharging,
  Wifi,
  Activity,
} from 'lucide-react';
import {
  DeviceStatus,
  DeviceType,
  Farm,
  IoTDevice,
  LandPlot,
} from '../types/smartfarm';

interface DevicesPageProps {
  devices: IoTDevice[];
  farms: Farm[];
  plots: LandPlot[];
  onSaveDevice: (device: IoTDevice) => void;
  onPingDevice: (deviceId: string) => void;
  onSimulateAllNodes: () => void;
}

export const DevicesPage: React.FC<DevicesPageProps> = ({
  devices,
  farms,
  plots,
  onSaveDevice,
  onPingDevice,
  onSimulateAllNodes,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [editingDevice, setEditingDevice] = useState<IoTDevice | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredDevices = devices.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.deviceCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const onlineCount = devices.filter((d) => d.status === 'Online').length;
  const meanBattery = Math.round(
    devices.reduce((acc, d) => acc + d.batteryPct, 0) / Math.max(devices.length, 1)
  );
  const meanUptime = (
    devices.reduce((acc, d) => acc + d.uptimePct, 0) / Math.max(devices.length, 1)
  ).toFixed(1);

  const openAddDevice = () => {
    setEditingDevice({
      id: `dev-${Date.now()}`,
      deviceCode: `SMP-GV-${100 + devices.length + 1}`,
      name: '',
      type: 'Soil Moisture Probe',
      farmId: farms[0]?.id || 'farm-1',
      plotId: plots[0]?.id || 'plot-101',
      status: 'Online',
      batteryPct: 96,
      signalRssi: -62,
      uptimePct: 99.9,
      firmware: 'v2.4.1-lora',
      samplingIntervalMin: 15,
      lastPing: 'Just now',
    });
    setIsModalOpen(true);
  };

  const openEditDevice = (device: IoTDevice) => {
    setEditingDevice({ ...device });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDevice || !editingDevice.name.trim()) return;
    onSaveDevice(editingDevice);
    setIsModalOpen(false);
    setEditingDevice(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-2xl border border-[#DCE4DF] p-5 lg:p-6">
        <div>
          <div className="text-xs font-bold text-[#145A3A]">
            WIRELESS SENSOR NETWORK & HARDWARE TELEMETRY SIMULATOR
          </div>
          <h1 className="text-2xl font-bold text-[#0F1E16] tracking-tight mt-0.5">
            IoT Sensor & Actuator Hardware Registry
          </h1>
          <p className="text-xs text-[#4A5D52] mt-0.5">
            Monitor node uptime, battery health, and LoRaWAN RSSI signal strength or simulate
            live packet pings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onSimulateAllNodes}
            className="px-3.5 py-2 text-xs font-semibold bg-[#F6F7F3] border border-[#145A3A] text-[#0F4C31] hover:bg-[#E8EFEA] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Simulate Network Sync</span>
          </button>
          <button
            onClick={openAddDevice}
            className="px-4 py-2 text-xs font-semibold bg-[#0F4C31] hover:bg-[#145A3A] text-white rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#A3E635]" />
            <span>Register IoT Node</span>
          </button>
        </div>
      </div>

      {/* 3 Hardware Health Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-[#DCE4DF] p-5">
          <div className="flex items-center justify-between text-xs text-[#4A5D52]">
            <span>Network Connectivity Status</span>
            <Wifi className="w-4 h-4 text-[#145A3A]" />
          </div>
          <div className="text-2xl font-bold text-[#0F1E16] font-mono-tabular mt-1.5">
            {onlineCount} / {devices.length} Nodes Online
          </div>
          <div className="text-xs text-[#145A3A] font-semibold mt-1">
            LoRaWAN & Wi-Fi simulated links
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#DCE4DF] p-5">
          <div className="flex items-center justify-between text-xs text-[#4A5D52]">
            <span>Mean Fleet Battery Reserve</span>
            <BatteryCharging className="w-4 h-4 text-[#237A4B]" />
          </div>
          <div className="text-2xl font-bold text-[#0F1E16] font-mono-tabular mt-1.5">
            {meanBattery}% Charge
          </div>
          <div className="text-xs text-[#4A5D52] mt-1">
            {devices.filter((d) => d.batteryPct <= 25).length} node(s) below 25% reserve
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#DCE4DF] p-5">
          <div className="flex items-center justify-between text-xs text-[#4A5D52]">
            <span>Mean Packet Delivery Uptime</span>
            <Activity className="w-4 h-4 text-[#145A3A]" />
          </div>
          <div className="text-2xl font-bold text-[#145A3A] font-mono-tabular mt-1.5">
            {meanUptime}% Uptime
          </div>
          <div className="text-xs text-[#4A5D52] mt-1">
            30-day simulated telemetry reliability
          </div>
        </div>
      </div>

      {/* Search & Status Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#DCE4DF] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#4A5D52] absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by device ID, node name, or hardware type..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#F6F7F3] border border-[#C5D6CC] rounded-xl focus:bg-white focus:outline-none focus:border-[#145A3A]"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#F6F7F3] rounded-xl border border-[#DCE4DF]">
          {['All', 'Online', 'Low Battery', 'Maintenance', 'Offline'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#0F4C31] text-white'
                  : 'text-[#4A5D52] hover:text-[#0F1E16]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Devices Table with Visual Battery & Signal Indicators */}
      <div className="bg-white rounded-2xl border border-[#DCE4DF] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E6ECE8] bg-[#FAFBF9] text-[11px] font-semibold text-[#4A5D52]">
                <th className="py-3 px-4">Device Code & Name</th>
                <th className="py-3 px-4">Hardware Class & FW</th>
                <th className="py-3 px-4">Assigned Farm & Parcel</th>
                <th className="py-3 px-4">Battery Health</th>
                <th className="py-3 px-4 text-right">Signal & Uptime</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Last Ping</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6ECE8] text-xs">
              {filteredDevices.map((device) => {
                const farm = farms.find((f) => f.id === device.farmId);
                const plot = plots.find((p) => p.id === device.plotId);
                return (
                  <tr key={device.id} className="hover:bg-[#F6F7F3]">
                    <td className="py-3.5 px-4">
                      <div className="font-mono-tabular font-bold text-[#145A3A]">
                        {device.deviceCode}
                      </div>
                      <div className="font-semibold text-[#0F1E16]">{device.name}</div>
                    </td>
                    <td className="py-3.5 px-4 text-[#4A5D52]">
                      <div className="text-[#0F1E16] font-medium">{device.type}</div>
                      <div className="text-[11px] font-mono-tabular">
                        FW: {device.firmware} · {device.samplingIntervalMin}m
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#4A5D52]">
                      <div className="text-[#0F1E16] font-medium">
                        {plot?.code} — {plot?.name}
                      </div>
                      <div className="text-[11px]">{farm?.name}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="w-28 space-y-1">
                        <div className="flex justify-between font-mono-tabular text-[11px]">
                          <span
                            className={`font-bold ${
                              device.batteryPct <= 25 ? 'text-[#B45309]' : 'text-[#0F1E16]'
                            }`}
                          >
                            {device.batteryPct}%
                          </span>
                          <span className="text-[#4A5D52]">LiFePO4</span>
                        </div>
                        <div className="h-2 w-full bg-[#E5EBE6] rounded-sm overflow-hidden">
                          <div
                            className={`h-full ${
                              device.batteryPct <= 25 ? 'bg-[#D97706]' : 'bg-[#145A3A]'
                            }`}
                            style={{ width: `${device.batteryPct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-tabular">
                      <div className="font-semibold text-[#0F1E16]">{device.signalRssi} dBm</div>
                      <div className="text-[11px] text-[#145A3A]">{device.uptimePct}% up</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-bold ${
                          device.status === 'Online'
                            ? 'text-[#145A3A]'
                            : device.status === 'Low Battery' ||
                              device.status === 'Maintenance'
                            ? 'text-[#B45309]'
                            : 'text-[#DC2626]'
                        }`}
                      >
                        {device.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-tabular text-[#4A5D52]">
                      {device.lastPing}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => onPingDevice(device.id)}
                          className="text-xs font-semibold text-[#237A4B] hover:underline inline-flex items-center gap-1 cursor-pointer"
                          title="Simulate test ping packet"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Ping</span>
                        </button>
                        <button
                          onClick={() => openEditDevice(device)}
                          className="text-xs font-semibold text-[#145A3A] hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Device Modal */}
      {isModalOpen && editingDevice && (
        <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#DCE4DF] max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E6ECE8] pb-3">
              <h3 className="text-base font-bold text-[#0F1E16] flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#145A3A]" />
                <span>
                  {devices.some((d) => d.id === editingDevice.id)
                    ? 'Edit IoT Hardware Node'
                    : 'Register New IoT Node'}
                </span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[#4A5D52] hover:text-[#0F1E16] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-[#0F1E16] mb-1">Device Code *</label>
                  <input
                    type="text"
                    required
                    value={editingDevice.deviceCode}
                    onChange={(e) =>
                      setEditingDevice({ ...editingDevice, deviceCode: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-[#C5D6CC] rounded-xl font-mono-tabular"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-medium text-[#0F1E16] mb-1">Node Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. East Field Soil Probe #4"
                    value={editingDevice.name}
                    onChange={(e) =>
                      setEditingDevice({ ...editingDevice, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-[#C5D6CC] rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#0F1E16] mb-1">Hardware Type</label>
                  <select
                    value={editingDevice.type}
                    onChange={(e) =>
                      setEditingDevice({
                        ...editingDevice,
                        type: e.target.value as DeviceType,
                      })
                    }
                    className="w-full px-3 py-2 border border-[#C5D6CC] rounded-xl bg-white"
                  >
                    <option value="Soil Moisture Probe">Soil Moisture Probe</option>
                    <option value="Micro-Climate Station">Micro-Climate Station</option>
                    <option value="NPK & pH Soil Analyzer">NPK & pH Soil Analyzer</option>
                    <option value="Smart Drip Valve">Smart Drip Valve</option>
                    <option value="LoRaWAN Gateway">LoRaWAN Gateway</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-[#0F1E16] mb-1">Status</label>
                  <select
                    value={editingDevice.status}
                    onChange={(e) =>
                      setEditingDevice({
                        ...editingDevice,
                        status: e.target.value as DeviceStatus,
                      })
                    }
                    className="w-full px-3 py-2 border border-[#C5D6CC] rounded-xl bg-white"
                  >
                    <option value="Online">Online</option>
                    <option value="Low Battery">Low Battery</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#0F1E16] mb-1">Assigned Farm</label>
                  <select
                    value={editingDevice.farmId}
                    onChange={(e) =>
                      setEditingDevice({ ...editingDevice, farmId: e.target.value })
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
                  <label className="block font-medium text-[#0F1E16] mb-1">Assigned Parcel</label>
                  <select
                    value={editingDevice.plotId}
                    onChange={(e) =>
                      setEditingDevice({ ...editingDevice, plotId: e.target.value })
                    }
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
                  <label className="block font-medium text-[#0F1E16] mb-1">Battery (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingDevice.batteryPct}
                    onChange={(e) =>
                      setEditingDevice({
                        ...editingDevice,
                        batteryPct: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-[#C5D6CC] rounded-xl font-mono-tabular"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#0F1E16] mb-1">Interval (min)</label>
                  <input
                    type="number"
                    min="1"
                    value={editingDevice.samplingIntervalMin}
                    onChange={(e) =>
                      setEditingDevice({
                        ...editingDevice,
                        samplingIntervalMin: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-[#C5D6CC] rounded-xl font-mono-tabular"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#0F1E16] mb-1">Firmware</label>
                  <input
                    type="text"
                    value={editingDevice.firmware}
                    onChange={(e) =>
                      setEditingDevice({ ...editingDevice, firmware: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-[#C5D6CC] rounded-xl font-mono-tabular"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E6ECE8]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#4A5D52] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-[#0F4C31] hover:bg-[#145A3A] text-white rounded-xl cursor-pointer"
                >
                  Save Hardware Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
