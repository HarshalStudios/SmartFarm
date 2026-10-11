export type PageId =
  | 'overview'
  | 'login'
  | 'dashboard'
  | 'crops'
  | 'crop-detail'
  | 'alerts'
  | 'alert-patterns'
  | 'farms'
  | 'devices'
  | 'profile';

export type TimeRange = '24h' | '7d';

export interface CropThresholds {
  moistureMin: number;
  moistureMax: number;
  tempMinC: number;
  tempMaxC: number;
  phMin: number;
  phMax: number;
  ecMin: number; // dS/m
  ecMax: number; // dS/m
  nitrogenMin: number;
}

export interface SensorReading {
  id: string;
  timestamp: string;
  dayLabel?: string;
  cropId: string;
  plotId: string;
  moisture: number; // %
  tempC: number; // Ambient Canopy °C
  soilTempC: number; // Root-Zone Soil °C
  humidity: number; // %
  ph: number; // pH scale (4.0 - 8.5)
  ecDsM: number; // Electrical Conductivity (dS/m)
  nitrogen: number; // mg/kg
  phosphorus: number; // mg/kg
  potassium: number; // mg/kg
  waterLiters?: number; // Simulated irrigation pulse volume
  isSimulated?: boolean;
  scenarioLabel?: string;
}

export interface Crop {
  id: string;
  name: string;
  scientificName: string;
  variety: string;
  category: 'Vegetables' | 'Cereals & Grains' | 'Orchard & Plantation' | 'Leafy Greens';
  farmId: string;
  plotId: string;
  plantedDate: string;
  expectedHarvestDate: string;
  growthStage: 'Seedling' | 'Vegetative' | 'Flowering' | 'Fruiting / Grain Fill' | 'Maturation';
  stageProgressPct: number; // 0-100
  healthIndex: number; // 0-100 demo health indicator
  currentMoisture: number;
  currentTempC: number;
  currentSoilTempC: number;
  currentHumidity: number;
  currentPh: number;
  currentEcDsM: number;
  nitrogenMgKg: number;
  phosphorusMgKg: number;
  potassiumMgKg: number;
  dailyWaterLiters: number;
  thresholds: CropThresholds;
  status: 'Optimal' | 'Attention' | 'Critical';
  history: SensorReading[]; // 24-hour intervals
  history7d: SensorReading[]; // 7-day daily summary intervals
  notes: string;
}

export interface Farm {
  id: string;
  name: string;
  code: string;
  location: string;
  totalAreaHa: number;
  cultivatedAreaHa: number;
  soilType: string;
  waterSource: string;
  dailyWaterBudgetLiters: number;
  establishedYear: number;
  manager: string;
  notes: string;
}

export interface LandPlot {
  id: string;
  farmId: string;
  name: string;
  code: string;
  areaHa: number;
  soilType: string;
  irrigationType: 'Subsurface Drip' | 'Overhead Sprinkler' | 'Furrow / Flood' | 'Precision Mist';
  cropId: string;
  elevationM: number;
  mapCoords: { x: number; y: number }; // Percentage coordinates for visual farm parcel map
}

export type AlertSeverity = 'Critical' | 'Warning' | 'Advisory';
export type AlertParameter =
  | 'Soil Moisture'
  | 'Canopy Temp'
  | 'Soil pH'
  | 'Soil EC'
  | 'Soil Nitrogen'
  | 'Node Battery';

export interface FarmAlert {
  id: string;
  timestamp: string;
  cropId: string;
  cropName: string;
  plotName: string;
  farmId: string;
  farmName: string;
  parameter: AlertParameter;
  measuredValue: string;
  thresholdValue: string;
  severity: AlertSeverity;
  message: string;
  prototypeAdvice: string;
  ruleTriggered: string;
  resolved: boolean;
  resolvedAt?: string;
  resolutionNote?: string;
}

export type DeviceType =
  | 'Soil Moisture Probe'
  | 'Micro-Climate Station'
  | 'NPK & pH Soil Analyzer'
  | 'Smart Drip Valve'
  | 'LoRaWAN Gateway';

export type DeviceStatus = 'Online' | 'Low Battery' | 'Maintenance' | 'Offline';

export interface IoTDevice {
  id: string;
  deviceCode: string;
  name: string;
  type: DeviceType;
  farmId: string;
  plotId: string;
  status: DeviceStatus;
  batteryPct: number;
  signalRssi: number; // dBm e.g. -68
  uptimePct: number; // e.g. 99.4%
  firmware: string;
  samplingIntervalMin: number;
  lastPing: string;
}

export interface IrrigationLog {
  day: string;
  scheduledLiters: number;
  automatedPulseLiters: number;
  evapotranspirationMm: number;
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  category: 'simulation' | 'alert' | 'irrigation' | 'device' | 'config';
  title: string;
  detail: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  description: string;
}

export interface UserProfile {
  fullName: string;
  roleTitle: string;
  studentId: string;
  department: string;
  institution: string;
  advisorName: string;
  email: string;
  tempUnit: 'C' | 'F';
  areaUnit: 'ha' | 'acres';
  autoHighlightThresholds: boolean;
  showAcademicDisclaimers: boolean;
}
