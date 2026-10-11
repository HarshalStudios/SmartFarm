import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home,
  LayoutDashboard,
  Sprout,
  Activity,
  Bell,
  BarChart3,
  MapPin,
  Cpu,
  User,
  LogIn,
  Menu,
  X,
  RefreshCw,
  Search,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  CheckCircle2,
} from 'lucide-react';
import {
  Crop,
  Farm,
  FarmAlert,
  IoTDevice,
  PageId,
  TimeRange,
  UserProfile,
} from '../types/smartfarm';

interface SidebarLayoutProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  farms: Farm[];
  selectedFarmId: string;
  onSelectFarmId: (farmId: string) => void;
  timeRange: TimeRange;
  onSelectTimeRange: (range: TimeRange) => void;
  crops: Crop[];
  devices: IoTDevice[];
  alerts: FarmAlert[];
  onSelectCrop: (cropId: string) => void;
  unresolvedAlertCount: number;
  selectedCropName: string;
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onSimulateGlobal: () => void;
  isSimulating: boolean;
  children: React.ReactNode;
}

interface NavItem {
  id: PageId;
  label: string;
  shortLabel: string;
  icon: React.FC<{ className?: string }>;
  count?: number;
}

export const SidebarLayout: React.FC<SidebarLayoutProps> = ({
  activePage,
  onNavigate,
  farms,
  selectedFarmId,
  onSelectFarmId,
  timeRange,
  onSelectTimeRange,
  crops,
  devices,
  alerts,
  onSelectCrop,
  unresolvedAlertCount,
  selectedCropName,
  profile,
  onUpdateProfile,
  onSimulateGlobal,
  isSimulating,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems: NavItem[] = [
    { id: 'overview', label: 'Overview', shortLabel: 'Overview', icon: Home },
    { id: 'dashboard', label: 'Dashboard', shortLabel: 'Dashboard', icon: LayoutDashboard },
    { id: 'crops', label: 'My Crops', shortLabel: 'My Crops', icon: Sprout },
    { id: 'crop-detail', label: 'Crop Sensors', shortLabel: 'Crop Sensors', icon: Activity },
    {
      id: 'alerts',
      label: 'Alerts & Advice',
      shortLabel: 'Alerts',
      icon: Bell,
      count: unresolvedAlertCount > 0 ? unresolvedAlertCount : undefined,
    },
    { id: 'alert-patterns', label: 'Alert Patterns', shortLabel: 'Alert Patterns', icon: BarChart3 },
    { id: 'farms', label: 'Farms & Lands', shortLabel: 'Farms & Lands', icon: MapPin },
    { id: 'devices', label: 'IoT Devices', shortLabel: 'IoT Devices', icon: Cpu },
    { id: 'profile', label: 'Profile', shortLabel: 'Profile', icon: User },
    { id: 'login', label: 'Demo Login', shortLabel: 'Demo Login', icon: LogIn },
  ];

  const currentNavItem = navItems.find((item) => item.id === activePage) || navItems[0];

  const handleNavClick = (id: PageId) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  // Global quick search matching
  const q = globalSearch.trim().toLowerCase();
  const matchedCrops = q
    ? crops.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.variety.toLowerCase().includes(q) ||
          c.scientificName.toLowerCase().includes(q)
      )
    : [];
  const matchedDevices = q
    ? devices.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.deviceCode.toLowerCase().includes(q) ||
          d.type.toLowerCase().includes(q)
      )
    : [];
  const matchedFarms = q
    ? farms.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.code.toLowerCase().includes(q) ||
          f.location.toLowerCase().includes(q)
      )
    : [];

  const activeAlerts = alerts.filter((a) => !a.resolved);

  return (
    <div className="min-h-screen flex bg-[#F6F7F3] text-[#0F1E16]">
      {/* Mobile & Tablet Overlay Sidebar Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[1px] lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-[#0F4C31] text-white flex flex-col shadow-2xl lg:hidden"
            >
              {/* Drawer Brand Header (Matches 56px Top Bar height) */}
              <div className="h-14 px-4 border-b border-[#196342] flex items-center justify-between shrink-0">
                <button
                  onClick={() => handleNavClick('overview')}
                  className="flex items-center gap-2.5 text-left cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#84CC16] text-[#092E1D] flex items-center justify-center font-bold text-xs shrink-0">
                    SF
                  </div>
                  <div>
                    <div className="text-sm font-bold tracking-tight text-white leading-none">
                      SmartFarm
                    </div>
                    <div className="text-[10px] text-[#B4D6C4] mt-0.5">
                      Precision IoT Demo
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-[#B4D6C4] hover:text-white hover:bg-[#145A3A] cursor-pointer"
                  aria-label="Close navigation menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Filter Controls Inside Drawer for Easy Access on Phones */}
              <div className="px-3 pt-3 pb-2 border-b border-[#196342] space-y-2 sm:hidden">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#A3E635] px-1">
                  Active Farm & Window
                </div>
                <select
                  value={selectedFarmId}
                  onChange={(e) => onSelectFarmId(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-medium bg-[#092E1D] text-white border border-[#1D7049] rounded-lg"
                >
                  <option value="ALL">All Research Farms ({farms.length})</option>
                  {farms.map((farm) => (
                    <option key={farm.id} value={farm.id}>
                      {farm.code} — {farm.name}
                    </option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-1 bg-[#092E1D] p-1 rounded-lg border border-[#1D7049]">
                  {(['24h', '7d'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => onSelectTimeRange(r)}
                      className={`py-1 text-xs font-semibold rounded-md transition-colors ${
                        timeRange === r
                          ? 'bg-[#1D7049] text-white'
                          : 'text-[#B4D6C4] hover:text-white'
                      }`}
                    >
                      {r === '24h' ? '24 Hours' : '7 Days'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Drawer Navigation List */}
              <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#1D7049] text-white font-semibold'
                          : 'text-[#D4E6DC] hover:bg-[#145A3A] hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-3 truncate">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? 'text-[#A3E635]' : 'text-[#A7CDBD]'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </span>
                      {item.count !== undefined && (
                        <span className="text-[10px] font-mono-tabular font-bold px-1.5 py-0.5 rounded bg-[#D97706] text-white">
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              <div className="p-3 border-t border-[#196342] bg-[#0B3B25] text-[11px]">
                <div className="font-semibold text-white truncate">{profile.fullName}</div>
                <div className="text-[#A3E635] font-mono-tabular mt-0.5">
                  DEMO MODE · Local State
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sticky Left Sidebar (Sleek 240px open / 64px collapsed, matches 56px header height) */}
      <aside
        className={`hidden lg:flex lg:flex-col lg:sticky lg:top-0 lg:h-screen ${
          sidebarCollapsed ? 'lg:w-16' : 'lg:w-60'
        } lg:shrink-0 bg-[#0F4C31] text-white border-r border-[#092E1D] select-none transition-all duration-200 z-30`}
      >
        {/* Brand Header — exact h-14 (56px) to align seamlessly with the top bar */}
        <div className="h-14 px-3.5 border-b border-[#196342] flex items-center justify-between shrink-0">
          <button
            onClick={() => handleNavClick('overview')}
            className="flex items-center gap-2.5 text-left group min-w-0 cursor-pointer"
            title="SmartFarm — Smart IoT-Based Precision Farming"
          >
            <div className="w-8 h-8 rounded-lg bg-[#84CC16] text-[#092E1D] flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              SF
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <div className="text-sm font-bold tracking-tight text-white truncate leading-tight">
                  SmartFarm
                </div>
                <div className="text-[10px] text-[#B4D6C4] truncate leading-tight">
                  Precision Agronomy
                </div>
              </div>
            )}
          </button>

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-lg text-[#B4D6C4] hover:text-white hover:bg-[#145A3A] transition-colors cursor-pointer shrink-0"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation Links */}
        <nav
          className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto"
          aria-label="Primary Navigation"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                title={item.label}
                className={`relative w-full flex items-center ${
                  sidebarCollapsed ? 'justify-center px-2' : 'justify-between px-3'
                } py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#1D7049] text-white font-semibold'
                    : 'text-[#D4E6DC] hover:bg-[#145A3A] hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active-bar"
                    className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#A3E635] rounded-r"
                  />
                )}
                <span className="flex items-center gap-2.5 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-[#A3E635]' : 'text-[#A7CDBD]'
                    }`}
                  />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </span>

                {!sidebarCollapsed && item.count !== undefined && (
                  <span className="text-[10px] font-mono-tabular font-bold px-1.5 py-0.5 rounded bg-[#D97706] text-white shrink-0">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Compact Sidebar Footer */}
        {!sidebarCollapsed && (
          <div className="p-3 border-t border-[#196342] bg-[#0B3B25] text-[11px] space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white truncate">{profile.fullName}</span>
              <span className="text-[10px] font-mono-tabular text-[#A3E635]">DEMO</span>
            </div>
            <div className="text-[#B4D6C4] truncate text-[10px]">
              °{profile.tempUnit} · {profile.areaUnit === 'ha' ? 'Hectares' : 'Acres'} · Local State
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Single Slim 56px (h-14) Top Navigation Bar across Mobile, Tablet, and Desktop */}
        <header className="sticky top-0 z-30 h-14 bg-white/95 backdrop-blur border-b border-[#DCE4DF] px-3 sm:px-5 lg:px-6 flex items-center justify-between gap-2 flex-nowrap">
          {/* Left Zone: Mobile Hamburger + Current Page Title + Compact Demo Tag */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-[#0F1E16] hover:bg-[#F1F4EF] border border-[#DCE4DF] transition-colors cursor-pointer shrink-0"
              aria-label="Open navigation menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <span className="font-bold text-sm text-[#0F1E16] truncate">
                {currentNavItem.shortLabel}
              </span>
              <span className="hidden xl:inline text-xs text-[#4A5D52] truncate">
                · {selectedCropName}
              </span>
              <span className="hidden md:inline-block text-[10px] font-bold tracking-wide text-[#0F4C31] bg-[#E8F3EC] px-2 py-0.5 rounded whitespace-nowrap shrink-0">
                DEMO MODE
              </span>
            </div>
          </div>

          {/* Right Zone: Compact Single-Line Controls (Never wraps into a tall bar) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Compact Farm Selector (visible on sm+) */}
            <div className="hidden sm:flex items-center gap-1 bg-[#F6F7F3] border border-[#D5E0D9] rounded-lg px-2 py-1">
              <MapPin className="w-3.5 h-3.5 text-[#145A3A] shrink-0" />
              <select
                value={selectedFarmId}
                onChange={(e) => onSelectFarmId(e.target.value)}
                aria-label="Filter by Research Farm"
                className="text-xs font-semibold text-[#0F1E16] bg-transparent focus:outline-none cursor-pointer max-w-[115px] md:max-w-[150px] truncate"
              >
                <option value="ALL">All Farms ({farms.length})</option>
                {farms.map((farm) => (
                  <option key={farm.id} value={farm.id}>
                    {farm.code} — {farm.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Compact 24h / 7d Segmented Switch (visible on sm+) */}
            <div
              className="hidden sm:flex items-center bg-[#F6F7F3] border border-[#D5E0D9] rounded-lg p-0.5"
              role="group"
              aria-label="Telemetry Date Range"
            >
              {(['24h', '7d'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => onSelectTimeRange(r)}
                  className={`px-2 py-0.5 text-[11px] font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    timeRange === r
                      ? 'bg-[#145A3A] text-white'
                      : 'text-[#4A5D52] hover:text-[#0F1E16]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Compact Search Input (Desktop/Tablet) + Mobile Search Toggle */}
            <div ref={searchRef} className="relative">
              <div className="hidden md:block w-40 lg:w-48 xl:w-56">
                <Search className="w-3.5 h-3.5 text-[#5A6D62] absolute left-2.5 top-2" />
                <input
                  type="text"
                  value={globalSearch}
                  onFocus={() => setSearchFocused(true)}
                  onChange={(e) => {
                    setGlobalSearch(e.target.value);
                    setSearchFocused(true);
                  }}
                  placeholder="Search crops, nodes..."
                  className="w-full pl-7 pr-2.5 py-1 text-xs bg-[#F6F7F3] border border-[#D5E0D9] rounded-lg focus:bg-white focus:outline-none focus:border-[#145A3A]"
                />
              </div>

              <button
                type="button"
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                className="md:hidden p-1.5 rounded-lg bg-[#F6F7F3] hover:bg-[#E8EFEA] border border-[#D5E0D9] text-[#0F1E16] cursor-pointer"
                aria-label="Search crops, farms, and devices"
              >
                <Search className="w-4 h-4" />
              </button>

              {searchFocused && q.length > 0 && (
                <div className="absolute right-0 mt-1.5 w-72 bg-white rounded-xl border border-[#DCE4DF] shadow-lg p-2 z-40 max-h-72 overflow-y-auto space-y-2 text-xs">
                  {matchedCrops.length === 0 &&
                  matchedDevices.length === 0 &&
                  matchedFarms.length === 0 ? (
                    <div className="p-2 text-[#4A5D52] text-center">
                      No matching crops, devices, or farms.
                    </div>
                  ) : (
                    <>
                      {matchedCrops.length > 0 && (
                        <div>
                          <div className="px-2 py-1 text-[10px] font-bold text-[#4A5D52]">
                            CROPS
                          </div>
                          {matchedCrops.map((c) => (
                            <button
                              key={c.id}
                              onClick={() => {
                                onSelectCrop(c.id);
                                onNavigate('crop-detail');
                                setSearchFocused(false);
                                setGlobalSearch('');
                              }}
                              className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#F1F4EF] flex items-center justify-between cursor-pointer"
                            >
                              <span className="font-semibold text-[#0F1E16] truncate">
                                {c.name}
                              </span>
                              <span className="font-mono-tabular text-[11px] text-[#145A3A] shrink-0">
                                {c.currentMoisture}%
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                      {matchedDevices.length > 0 && (
                        <div>
                          <div className="px-2 py-1 text-[10px] font-bold text-[#4A5D52]">
                            IOT NODES
                          </div>
                          {matchedDevices.map((d) => (
                            <button
                              key={d.id}
                              onClick={() => {
                                onNavigate('devices');
                                setSearchFocused(false);
                                setGlobalSearch('');
                              }}
                              className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#F1F4EF] flex items-center justify-between cursor-pointer"
                            >
                              <span className="font-semibold text-[#0F1E16] truncate">
                                {d.name}
                              </span>
                              <span className="font-mono-tabular text-[11px] text-[#4A5D52] shrink-0">
                                {d.deviceCode}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                      {matchedFarms.length > 0 && (
                        <div>
                          <div className="px-2 py-1 text-[10px] font-bold text-[#4A5D52]">
                            FARMS
                          </div>
                          {matchedFarms.map((f) => (
                            <button
                              key={f.id}
                              onClick={() => {
                                onSelectFarmId(f.id);
                                onNavigate('farms');
                                setSearchFocused(false);
                                setGlobalSearch('');
                              }}
                              className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#F1F4EF] flex items-center justify-between cursor-pointer"
                            >
                              <span className="font-semibold text-[#0F1E16] truncate">
                                {f.name}
                              </span>
                              <span className="font-mono-tabular text-[11px] text-[#145A3A] shrink-0">
                                {f.code}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Compact Simulate Reading CTA */}
            <button
              onClick={onSimulateGlobal}
              disabled={isSimulating}
              className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-white bg-[#145A3A] hover:bg-[#1D7049] active:scale-[0.99] rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              title="Simulate a live IoT sensor reading"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">
                {isSimulating ? 'Simulating...' : 'Simulate'}
              </span>
            </button>

            {/* Notifications Bell */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-1.5 rounded-lg bg-[#F6F7F3] hover:bg-[#E8EFEA] border border-[#D5E0D9] text-[#0F1E16] transition-colors cursor-pointer"
                aria-label="Open threshold alerts menu"
              >
                <Bell className="w-4 h-4" />
                {unresolvedAlertCount > 0 && (
                  <span className="absolute -top-1 -right-1 px-1 text-[9px] font-mono-tabular font-bold rounded-full bg-[#DC2626] text-white">
                    {unresolvedAlertCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl border border-[#DCE4DF] shadow-lg p-3 z-40 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between border-b border-[#E6ECE8] pb-2">
                    <span className="font-bold text-[#0F1E16]">
                      Active Alerts ({unresolvedAlertCount})
                    </span>
                    <button
                      onClick={() => {
                        setNotifOpen(false);
                        onNavigate('alerts');
                      }}
                      className="text-[#145A3A] font-semibold hover:underline cursor-pointer"
                    >
                      View All
                    </button>
                  </div>

                  {activeAlerts.length === 0 ? (
                    <div className="py-4 text-center text-[#4A5D52] flex flex-col items-center gap-1">
                      <CheckCircle2 className="w-5 h-5 text-[#145A3A]" />
                      <span>All simulated crop thresholds are nominal.</span>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {activeAlerts.slice(0, 4).map((a) => (
                        <button
                          key={a.id}
                          onClick={() => {
                            setNotifOpen(false);
                            onNavigate('alerts');
                          }}
                          className="w-full text-left p-2.5 rounded-lg bg-[#FAFBF9] hover:bg-[#F1F4EF] border border-[#E4EBE6] space-y-1 cursor-pointer block"
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`font-bold ${
                                a.severity === 'Critical'
                                  ? 'text-[#DC2626]'
                                  : 'text-[#B45309]'
                              }`}
                            >
                              {a.severity}: {a.parameter}
                            </span>
                            <span className="font-mono-tabular text-[11px] text-[#4A5D52]">
                              {a.measuredValue}
                            </span>
                          </div>
                          <div className="text-[#0F1E16] font-medium truncate">
                            {a.cropName} · {a.plotName}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Compact Profile Avatar Button */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-1.5 p-1 sm:pr-2 rounded-lg bg-[#F6F7F3] hover:bg-[#E8EFEA] border border-[#D5E0D9] text-xs font-semibold text-[#0F1E16] cursor-pointer"
                aria-label="Open profile menu"
              >
                <span className="w-6 h-6 rounded-md bg-[#145A3A] text-white flex items-center justify-center text-[10px] font-bold">
                  {profile.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </span>
                <ChevronDown className="w-3 h-3 text-[#4A5D52] hidden sm:inline" />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl border border-[#DCE4DF] shadow-lg p-3 z-40 space-y-3 text-xs">
                  <div className="border-b border-[#E6ECE8] pb-2">
                    <div className="font-bold text-[#0F1E16] truncate">{profile.fullName}</div>
                    <div className="text-[11px] text-[#4A5D52] truncate">{profile.roleTitle}</div>
                  </div>

                  {/* Quick Unit Toggles */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[#4A5D52]">Temp Unit:</span>
                      <div className="flex gap-1">
                        {(['C', 'F'] as const).map((u) => (
                          <button
                            key={u}
                            onClick={() => onUpdateProfile({ tempUnit: u })}
                            className={`px-2 py-0.5 rounded font-mono-tabular font-semibold cursor-pointer ${
                              profile.tempUnit === u
                                ? 'bg-[#145A3A] text-white'
                                : 'bg-[#F1F4EF] text-[#4A5D52]'
                            }`}
                          >
                            °{u}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#4A5D52]">Area Unit:</span>
                      <div className="flex gap-1">
                        {(['ha', 'acres'] as const).map((u) => (
                          <button
                            key={u}
                            onClick={() => onUpdateProfile({ areaUnit: u })}
                            className={`px-2 py-0.5 rounded font-mono-tabular font-semibold cursor-pointer ${
                              profile.areaUnit === u
                                ? 'bg-[#145A3A] text-white'
                                : 'bg-[#F1F4EF] text-[#4A5D52]'
                            }`}
                          >
                            {u}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[#E6ECE8] pt-2 flex flex-col gap-1">
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        onNavigate('profile');
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#F1F4EF] font-medium text-[#0F1E16] cursor-pointer"
                    >
                      Profile & Preferences
                    </button>
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        onNavigate('login');
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#F1F4EF] font-medium text-[#145A3A] cursor-pointer"
                    >
                      Switch Demo Persona (Login)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Expandable Mobile Search Bar (only shown on small phones when Search icon is tapped) */}
        <AnimatePresence>
          {mobileSearchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-[#DCE4DF] px-3 py-2"
            >
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#5A6D62] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  placeholder="Search crops, IoT nodes, or farms..."
                  className="w-full pl-8 pr-8 py-1.5 text-xs bg-[#F6F7F3] border border-[#D5E0D9] rounded-lg focus:bg-white focus:outline-none focus:border-[#145A3A]"
                  autoFocus
                />
                <button
                  onClick={() => {
                    setMobileSearchOpen(false);
                    setGlobalSearch('');
                  }}
                  className="absolute right-2.5 top-2 text-[#4A5D52]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {q.length > 0 && (
                <div className="mt-2 max-h-52 overflow-y-auto space-y-1 text-xs">
                  {matchedCrops.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        onSelectCrop(c.id);
                        onNavigate('crop-detail');
                        setMobileSearchOpen(false);
                        setGlobalSearch('');
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#F1F4EF] flex justify-between"
                    >
                      <span className="font-semibold">{c.name}</span>
                      <span className="font-mono-tabular text-[#145A3A]">
                        {c.currentMoisture}%
                      </span>
                    </button>
                  ))}
                  {matchedDevices.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => {
                        onNavigate('devices');
                        setMobileSearchOpen(false);
                        setGlobalSearch('');
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#F1F4EF] flex justify-between"
                    >
                      <span className="font-semibold">{d.name}</span>
                      <span className="font-mono-tabular text-[#4A5D52]">
                        {d.deviceCode}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Responsive Viewport across Mobile, Tablet, and Desktop */}
        <main className="flex-1 p-3.5 sm:p-5 lg:p-6 max-w-[1380px] w-full mx-auto">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.16 }}
          >
            {children}
          </motion.div>
        </main>

        {/* Compact Responsive Footer */}
        <footer className="px-4 sm:px-6 py-3.5 border-t border-[#DCE4DF] bg-white text-[11px] text-[#4A5D52] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            SmartFarm — Smart IoT-Based Precision Farming · College Project Demo (Local State)
          </div>
          <div>
            Sample telemetry and agronomic notes are non-validated illustrations.
          </div>
        </footer>
      </div>
    </div>
  );
};
