/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ActivityEvent,
  Crop,
  CropThresholds,
  Farm,
  FarmAlert,
  IoTDevice,
  IrrigationLog,
  LandPlot,
  PageId,
  SensorReading,
  TimeRange,
  ToastMessage,
  UserProfile,
} from './types/smartfarm';
import {
  INITIAL_ACTIVITY_TIMELINE,
  INITIAL_ALERTS,
  INITIAL_CROPS,
  INITIAL_DEVICES,
  INITIAL_FARMS,
  INITIAL_IRRIGATION_LOGS,
  INITIAL_PLOTS,
  INITIAL_PROFILE,
} from './data/mockData';
import { SidebarLayout } from './components/SidebarLayout';
import { ToastViewport } from './components/UiPrimitives';
import { OverviewPage } from './pages/OverviewPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { MyCropsPage } from './pages/MyCropsPage';
import { CropDetailPage } from './pages/CropDetailPage';
import { AlertsAdvicePage } from './pages/AlertsAdvicePage';
import { AlertPatternsPage } from './pages/AlertPatternsPage';
import { FarmsLandsPage } from './pages/FarmsLandsPage';
import { DevicesPage } from './pages/DevicesPage';
import { ProfilePage } from './pages/ProfilePage';

export default function App() {
  const [activePage, setActivePage] = useState<PageId>('overview');
  const [farms, setFarms] = useState<Farm[]>(INITIAL_FARMS);
  const [plots, setPlots] = useState<LandPlot[]>(INITIAL_PLOTS);
  const [crops, setCrops] = useState<Crop[]>(INITIAL_CROPS);
  const [alerts, setAlerts] = useState<FarmAlert[]>(INITIAL_ALERTS);
  const [devices, setDevices] = useState<IoTDevice[]>(INITIAL_DEVICES);
  const [irrigationLogs, setIrrigationLogs] = useState<IrrigationLog[]>(
    INITIAL_IRRIGATION_LOGS
  );
  const [activityTimeline, setActivityTimeline] = useState<ActivityEvent[]>(
    INITIAL_ACTIVITY_TIMELINE
  );
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);

  const [selectedFarmId, setSelectedFarmId] = useState<string>('ALL');
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [selectedCropId, setSelectedCropId] = useState<string>(INITIAL_CROPS[0].id);
  const [simCounter, setSimCounter] = useState<number>(1);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const pushToast = (
    type: ToastMessage['type'],
    title: string,
    description: string
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev.slice(-3), { id, type, title, description }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const pushActivity = (
    category: ActivityEvent['category'],
    title: string,
    detail: string,
    timestamp: string
  ) => {
    setActivityTimeline((prev) => [
      { id: `act-${Date.now()}-${Math.random()}`, timestamp, category, title, detail },
      ...prev.slice(0, 14),
    ]);
  };

  const evaluateCropStatus = (
    moisture: number,
    tempC: number,
    ph: number,
    nitrogen: number,
    thresholds: CropThresholds
  ): Crop['status'] => {
    const moistureViolation =
      moisture < thresholds.moistureMin || moisture > thresholds.moistureMax;
    const tempViolation = tempC < thresholds.tempMinC || tempC > thresholds.tempMaxC;
    const phViolation = ph < thresholds.phMin || ph > thresholds.phMax;
    const nViolation = nitrogen < thresholds.nitrogenMin;

    if (moistureViolation && tempViolation) return 'Critical';
    if (moistureViolation) return 'Critical';
    if (tempViolation || phViolation || nViolation) return 'Attention';
    return 'Optimal';
  };

  const getFormattedTime = (offsetStep: number) => {
    const totalMinutes = 12 * 60 + offsetStep * 15;
    const hh = String(Math.floor(totalMinutes / 60) % 24).padStart(2, '0');
    const mm = String(totalMinutes % 60).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const handleSimulateCropReading = (cropId: string, mode: 'normal' | 'stress') => {
    const targetCrop = crops.find((c) => c.id === cropId) || crops[0];
    if (!targetCrop) return;

    setIsSimulating(true);
    setTimeout(() => setIsSimulating(false), 240);

    const plot = plots.find((p) => p.id === targetCrop.plotId);
    const farm = farms.find((f) => f.id === targetCrop.farmId);
    const nextStep = simCounter;
    setSimCounter((prev) => prev + 1);
    const timeLabel = getFormattedTime(nextStep);

    let newMoisture: number;
    let newTempC: number;
    let newSoilTempC: number;
    let newHumidity: number;
    let newPh: number;
    let newEc: number;
    let newNitrogen: number;
    let newHealth: number;

    if (mode === 'stress') {
      newMoisture = Number((targetCrop.thresholds.moistureMin - 5.2).toFixed(1));
      newTempC = Number((targetCrop.thresholds.tempMaxC + 2.2).toFixed(1));
      newSoilTempC = Number((newTempC - 4.1).toFixed(1));
      newHumidity = Math.max(38, targetCrop.currentHumidity - 6);
      newPh = Number(targetCrop.currentPh.toFixed(1));
      newEc = Number(Math.min(3.1, targetCrop.currentEcDsM + 0.2).toFixed(1));
      newNitrogen = targetCrop.nitrogenMgKg;
      newHealth = Math.max(62, targetCrop.healthIndex - 8);
    } else {
      const midMoisture =
        (targetCrop.thresholds.moistureMin + targetCrop.thresholds.moistureMax) / 2;
      const jitter = (Math.random() - 0.5) * 3.8;
      newMoisture = Number((midMoisture + jitter).toFixed(1));
      const midTemp = (targetCrop.thresholds.tempMinC + targetCrop.thresholds.tempMaxC) / 2;
      newTempC = Number((midTemp + (Math.random() - 0.5) * 2.0).toFixed(1));
      newSoilTempC = Number((newTempC - 3.4).toFixed(1));
      newHumidity = Math.min(
        88,
        Math.max(54, Math.round(targetCrop.currentHumidity + (Math.random() - 0.5) * 4))
      );
      newPh = Number(
        ((targetCrop.thresholds.phMin + targetCrop.thresholds.phMax) / 2).toFixed(1)
      );
      newEc = Number(
        ((targetCrop.thresholds.ecMin + targetCrop.thresholds.ecMax) / 2).toFixed(1)
      );
      newNitrogen = Math.max(targetCrop.thresholds.nitrogenMin + 10, targetCrop.nitrogenMgKg);
      newHealth = Math.min(98, Math.max(88, targetCrop.healthIndex + 4));
    }

    const newReading: SensorReading = {
      id: `sim-${Date.now()}`,
      timestamp: timeLabel,
      cropId: targetCrop.id,
      plotId: targetCrop.plotId,
      moisture: newMoisture,
      tempC: newTempC,
      soilTempC: newSoilTempC,
      humidity: newHumidity,
      ph: newPh,
      ecDsM: newEc,
      nitrogen: newNitrogen,
      phosphorus: targetCrop.phosphorusMgKg,
      potassium: targetCrop.potassiumMgKg,
      isSimulated: true,
      scenarioLabel: mode === 'stress' ? 'Threshold Breach Test' : 'Nominal Telemetry',
    };

    const updatedStatus = evaluateCropStatus(
      newMoisture,
      newTempC,
      newPh,
      newNitrogen,
      targetCrop.thresholds
    );

    setCrops((prev) =>
      prev.map((c) =>
        c.id === targetCrop.id
          ? {
              ...c,
              currentMoisture: newMoisture,
              currentTempC: newTempC,
              currentSoilTempC: newSoilTempC,
              currentHumidity: newHumidity,
              currentPh: newPh,
              currentEcDsM: newEc,
              nitrogenMgKg: newNitrogen,
              healthIndex: newHealth,
              status: updatedStatus,
              history: [...c.history.slice(-8), newReading],
              history7d: [
                ...c.history7d.slice(0, -1),
                { ...newReading, timestamp: 'Oct 11 (Live)' },
              ],
            }
          : c
      )
    );

    const generatedAlerts: FarmAlert[] = [];

    if (newMoisture < targetCrop.thresholds.moistureMin) {
      generatedAlerts.push({
        id: `alert-${Date.now()}-m`,
        timestamp: `2026-10-11 ${timeLabel}`,
        cropId: targetCrop.id,
        cropName: targetCrop.name,
        plotName: plot?.name || 'Plot A',
        farmId: targetCrop.farmId,
        farmName: farm?.name || 'Research Farm',
        parameter: 'Soil Moisture',
        measuredValue: `${newMoisture}%`,
        thresholdValue: `Min ${targetCrop.thresholds.moistureMin}%`,
        severity: 'Critical',
        ruleTriggered: `RULE_SOIL_VWC_LOW (< ${targetCrop.thresholds.moistureMin}%)`,
        message: `Simulated moisture reading (${newMoisture}%) dropped below configured lower bound (${targetCrop.thresholds.moistureMin}%) for ${targetCrop.name}.`,
        prototypeAdvice:
          '[DEMO SAMPLE LOGIC — NOT AGRONOMIC PRESCRIPTION]: Sample rule suggests triggering a simulated 15-minute drip pulse and verifying capacitance probe contact.',
        resolved: false,
      });
    }

    if (newTempC > targetCrop.thresholds.tempMaxC) {
      generatedAlerts.push({
        id: `alert-${Date.now()}-t`,
        timestamp: `2026-10-11 ${timeLabel}`,
        cropId: targetCrop.id,
        cropName: targetCrop.name,
        plotName: plot?.name || 'Plot A',
        farmId: targetCrop.farmId,
        farmName: farm?.name || 'Research Farm',
        parameter: 'Canopy Temp',
        measuredValue: `${newTempC}°C`,
        thresholdValue: `Max ${targetCrop.thresholds.tempMaxC}°C`,
        severity: 'Warning',
        ruleTriggered: `RULE_CANOPY_TEMP_HIGH (> ${targetCrop.thresholds.tempMaxC}°C)`,
        message: `Simulated canopy temperature (${newTempC}°C) exceeded upper threshold (${targetCrop.thresholds.tempMaxC}°C) for ${targetCrop.name}.`,
        prototypeAdvice:
          '[DEMO SAMPLE LOGIC — NOT AGRONOMIC PRESCRIPTION]: Sample rule recommends checking polyhouse louvers or shade-net status (demo illustration only).',
        resolved: false,
      });
    }

    if (generatedAlerts.length > 0) {
      setAlerts((prev) => [...generatedAlerts, ...prev]);
      setIrrigationLogs((prev) =>
        prev.map((log, idx) =>
          idx === prev.length - 1
            ? { ...log, automatedPulseLiters: log.automatedPulseLiters + 1200 }
            : log
        )
      );
      pushActivity(
        'alert',
        `Threshold Breach Simulated (${targetCrop.name.split(' ')[0]})`,
        `Moisture ${newMoisture}%, Temp ${newTempC}°C triggered ${generatedAlerts.length} alert(s).`,
        timeLabel
      );
      pushToast(
        'warning',
        `Threshold Breach: ${targetCrop.name}`,
        `Moisture ${newMoisture}% & Temp ${newTempC}°C generated ${generatedAlerts.length} new alert(s).`
      );
    } else {
      pushActivity(
        'simulation',
        `Nominal Reading Logged (${targetCrop.name.split(' ')[0]})`,
        `Moisture ${newMoisture}%, Temp ${newTempC}°C, Soil ${newSoilTempC}°C within safe bounds.`,
        timeLabel
      );
      pushToast(
        'success',
        `Simulated Telemetry: ${targetCrop.name}`,
        `Moisture ${newMoisture}% · Canopy ${newTempC}°C (all thresholds nominal).`
      );
    }
  };

  const handleSimulateGlobal = () => {
    const shouldTriggerAlert = simCounter % 2 === 1;
    handleSimulateCropReading(
      selectedCropId || crops[0].id,
      shouldTriggerAlert ? 'stress' : 'normal'
    );
  };

  const handleUpdateCropThresholds = (cropId: string, newThresholds: CropThresholds) => {
    const targetCrop = crops.find((c) => c.id === cropId);
    if (!targetCrop) return;

    const newStatus = evaluateCropStatus(
      targetCrop.currentMoisture,
      targetCrop.currentTempC,
      targetCrop.currentPh,
      targetCrop.nitrogenMgKg,
      newThresholds
    );

    setCrops((prev) =>
      prev.map((c) =>
        c.id === cropId
          ? {
              ...c,
              thresholds: newThresholds,
              status: newStatus,
            }
          : c
      )
    );

    const timeLabel = getFormattedTime(simCounter);

    if (targetCrop.currentMoisture < newThresholds.moistureMin) {
      const plot = plots.find((p) => p.id === targetCrop.plotId);
      const farm = farms.find((f) => f.id === targetCrop.farmId);
      const newAlert: FarmAlert = {
        id: `alert-thresh-${Date.now()}`,
        timestamp: `2026-10-11 ${timeLabel}`,
        cropId: targetCrop.id,
        cropName: targetCrop.name,
        plotName: plot?.name || 'Plot',
        farmId: targetCrop.farmId,
        farmName: farm?.name || 'Farm',
        parameter: 'Soil Moisture',
        measuredValue: `${targetCrop.currentMoisture}%`,
        thresholdValue: `Min ${newThresholds.moistureMin}%`,
        severity: 'Critical',
        ruleTriggered: `RULE_SOIL_VWC_LOW (< ${newThresholds.moistureMin}%)`,
        message: `Threshold updated: Current moisture (${targetCrop.currentMoisture}%) is below the newly configured minimum (${newThresholds.moistureMin}%).`,
        prototypeAdvice:
          '[DEMO SAMPLE LOGIC — NOT AGRONOMIC PRESCRIPTION]: Threshold sensitivity increased by operator; sample irrigation rule flagged.',
        resolved: false,
      };
      setAlerts((prev) => [newAlert, ...prev]);
      pushToast(
        'warning',
        'Thresholds Updated & Alert Triggered',
        `${targetCrop.name} current moisture (${targetCrop.currentMoisture}%) is below new ${newThresholds.moistureMin}% limit.`
      );
    } else {
      pushToast(
        'success',
        'Threshold Rules Updated',
        `Saved new safe operating bounds for ${targetCrop.name}.`
      );
    }
    pushActivity(
      'config',
      `Thresholds Updated (${targetCrop.name.split(' ')[0]})`,
      `Moisture window set to ${newThresholds.moistureMin}%–${newThresholds.moistureMax}%.`,
      timeLabel
    );
  };

  const handleResolveAlert = (alertId: string, note?: string) => {
    const timeStr = `2026-10-11 ${getFormattedTime(simCounter)}`;
    const target = alerts.find((a) => a.id === alertId);
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? {
              ...a,
              resolved: true,
              resolvedAt: timeStr,
              resolutionNote: note || 'Marked resolved during demo evaluation.',
            }
          : a
      )
    );
    if (target) {
      pushToast(
        'success',
        `Alert Resolved: ${target.parameter}`,
        `${target.cropName} alert marked resolved.`
      );
      pushActivity(
        'alert',
        `Resolved ${target.parameter} Alert`,
        `${target.cropName}: "${note || 'Marked resolved'}"`,
        getFormattedTime(simCounter)
      );
    }
  };

  const handleResolveAllAlerts = () => {
    const timeStr = `2026-10-11 ${getFormattedTime(simCounter)}`;
    setAlerts((prev) =>
      prev.map((a) =>
        a.resolved
          ? a
          : {
              ...a,
              resolved: true,
              resolvedAt: timeStr,
              resolutionNote: 'Batch resolved from Alerts console.',
            }
      )
    );
    pushToast(
      'success',
      'All Active Alerts Resolved',
      'All unresolved threshold alerts have been acknowledged in local state.'
    );
  };

  const handleAddCrop = (
    newCropData: Omit<Crop, 'id' | 'history' | 'history7d' | 'status'>
  ) => {
    const id = `crop-${Date.now()}`;
    const status = evaluateCropStatus(
      newCropData.currentMoisture,
      newCropData.currentTempC,
      newCropData.currentPh,
      newCropData.nitrogenMgKg,
      newCropData.thresholds
    );
    const baseReadings: SensorReading[] = ['09:00', '10:00', '11:00', '12:00'].map(
      (t, i) => ({
        id: `r-${Date.now()}-${i}`,
        timestamp: t,
        cropId: id,
        plotId: newCropData.plotId,
        moisture: Number((newCropData.currentMoisture + (3 - i) * 0.6).toFixed(1)),
        tempC: Number((newCropData.currentTempC - (3 - i) * 0.4).toFixed(1)),
        soilTempC: Number((newCropData.currentSoilTempC - (3 - i) * 0.3).toFixed(1)),
        humidity: newCropData.currentHumidity + (3 - i),
        ph: newCropData.currentPh,
        ecDsM: newCropData.currentEcDsM,
        nitrogen: newCropData.nitrogenMgKg,
        phosphorus: newCropData.phosphorusMgKg,
        potassium: newCropData.potassiumMgKg,
        isSimulated: true,
        scenarioLabel: 'Initial Planting Baseline',
      })
    );

    const created: Crop = {
      ...newCropData,
      id,
      status,
      history: baseReadings,
      history7d: baseReadings.map((r, i) => ({ ...r, timestamp: `Oct 0${i + 8}` })),
    };

    setCrops((prev) => [created, ...prev]);
    setSelectedCropId(id);
    pushToast(
      'success',
      'New Demo Crop Added',
      `${created.name} (${created.variety}) added to local catalogue.`
    );
  };

  const handleSaveFarm = (farm: Farm) => {
    setFarms((prev) => {
      const exists = prev.some((f) => f.id === farm.id);
      return exists ? prev.map((f) => (f.id === farm.id ? farm : f)) : [...prev, farm];
    });
    pushToast('success', 'Farm Record Saved', `${farm.name} (${farm.code}) updated.`);
  };

  const handleSavePlot = (plot: LandPlot) => {
    setPlots((prev) => {
      const exists = prev.some((p) => p.id === plot.id);
      return exists ? prev.map((p) => (p.id === plot.id ? plot : p)) : [...prev, plot];
    });
    pushToast('success', 'Land Parcel Saved', `${plot.code} — ${plot.name} updated.`);
  };

  const handleSaveDevice = (device: IoTDevice) => {
    setDevices((prev) => {
      const exists = prev.some((d) => d.id === device.id);
      return exists ? prev.map((d) => (d.id === device.id ? device : d)) : [device, ...prev];
    });
    pushToast(
      'success',
      'Hardware Node Saved',
      `${device.deviceCode} (${device.name}) saved in local registry.`
    );
  };

  const handlePingDevice = (deviceId: string) => {
    const target = devices.find((d) => d.id === deviceId);
    setDevices((prev) =>
      prev.map((d) =>
        d.id === deviceId
          ? {
              ...d,
              lastPing: 'Just now (ACK OK)',
              signalRssi: Math.min(
                -40,
                Math.max(-85, d.signalRssi + (Math.random() > 0.5 ? 2 : -2))
              ),
            }
          : d
      )
    );
    if (target) {
      pushToast(
        'info',
        `Node Ping ACK: ${target.deviceCode}`,
        `Received simulated LoRaWAN packet from ${target.name}.`
      );
    }
  };

  const handleSimulateAllNodes = () => {
    setDevices((prev) =>
      prev.map((d) => ({
        ...d,
        lastPing: 'Just now (Synced)',
        signalRssi: Math.min(-42, Math.max(-82, d.signalRssi + (Math.random() > 0.5 ? 1 : -1))),
      }))
    );
    pushToast(
      'success',
      'Wireless Network Sync Complete',
      `All ${devices.length} simulated field nodes reported telemetry packets.`
    );
  };

  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updated }));
    pushToast('info', 'Session Preferences Updated', 'Updated profile settings locally.');
  };

  const handleResetAllDemoData = () => {
    setFarms(INITIAL_FARMS);
    setPlots(INITIAL_PLOTS);
    setCrops(INITIAL_CROPS);
    setAlerts(INITIAL_ALERTS);
    setDevices(INITIAL_DEVICES);
    setIrrigationLogs(INITIAL_IRRIGATION_LOGS);
    setActivityTimeline(INITIAL_ACTIVITY_TIMELINE);
    setProfile(INITIAL_PROFILE);
    setSelectedFarmId('ALL');
    setSelectedCropId(INITIAL_CROPS[0].id);
    setSimCounter(1);
    pushToast(
      'info',
      'Demo State Reset',
      'Restored all farms, crops, sensors, and alerts to baseline demo values.'
    );
  };

  const selectedCrop = crops.find((c) => c.id === selectedCropId) || crops[0];
  const unresolvedAlertCount = alerts.filter((a) => !a.resolved).length;

  return (
    <>
      <SidebarLayout
        activePage={activePage}
        onNavigate={setActivePage}
        farms={farms}
        selectedFarmId={selectedFarmId}
        onSelectFarmId={setSelectedFarmId}
        timeRange={timeRange}
        onSelectTimeRange={setTimeRange}
        crops={crops}
        devices={devices}
        alerts={alerts}
        onSelectCrop={setSelectedCropId}
        unresolvedAlertCount={unresolvedAlertCount}
        selectedCropName={selectedCrop?.name || 'Crop'}
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
        onSimulateGlobal={handleSimulateGlobal}
        isSimulating={isSimulating}
      >
        {activePage === 'overview' && (
          <OverviewPage
            farms={farms}
            crops={crops}
            devices={devices}
            alerts={alerts}
            profile={profile}
            onNavigate={setActivePage}
            onSelectCrop={setSelectedCropId}
            onSimulateGlobal={handleSimulateGlobal}
          />
        )}

        {activePage === 'login' && (
          <LoginPage
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onNavigate={setActivePage}
          />
        )}

        {activePage === 'dashboard' && (
          <DashboardPage
            farms={farms}
            plots={plots}
            crops={crops}
            alerts={alerts}
            devices={devices}
            irrigationLogs={irrigationLogs}
            activityTimeline={activityTimeline}
            selectedFarmId={selectedFarmId}
            onSelectFarmId={setSelectedFarmId}
            timeRange={timeRange}
            onSelectTimeRange={setTimeRange}
            profile={profile}
            onNavigate={setActivePage}
            onSelectCrop={setSelectedCropId}
            onSimulateCropReading={handleSimulateCropReading}
            onResolveAlert={handleResolveAlert}
          />
        )}

        {activePage === 'crops' && (
          <MyCropsPage
            crops={crops}
            farms={farms}
            plots={plots}
            profile={profile}
            onSelectCrop={setSelectedCropId}
            onNavigate={setActivePage}
            onAddCrop={handleAddCrop}
          />
        )}

        {activePage === 'crop-detail' && (
          <CropDetailPage
            crops={crops}
            selectedCropId={selectedCrop.id}
            farms={farms}
            plots={plots}
            alerts={alerts}
            timeRange={timeRange}
            onSelectTimeRange={setTimeRange}
            profile={profile}
            onSelectCrop={setSelectedCropId}
            onNavigate={setActivePage}
            onSimulateCropReading={handleSimulateCropReading}
            onUpdateCropThresholds={handleUpdateCropThresholds}
            onResolveAlert={handleResolveAlert}
          />
        )}

        {activePage === 'alerts' && (
          <AlertsAdvicePage
            alerts={alerts}
            crops={crops}
            onResolveAlert={handleResolveAlert}
            onResolveAll={handleResolveAllAlerts}
            onSimulateCropReading={handleSimulateCropReading}
            onSelectCrop={setSelectedCropId}
            onNavigate={setActivePage}
          />
        )}

        {activePage === 'alert-patterns' && (
          <AlertPatternsPage
            alerts={alerts}
            crops={crops}
            onNavigate={setActivePage}
            onSelectCrop={setSelectedCropId}
            onSimulateCropReading={handleSimulateCropReading}
          />
        )}

        {activePage === 'farms' && (
          <FarmsLandsPage
            farms={farms}
            plots={plots}
            crops={crops}
            profile={profile}
            onSaveFarm={handleSaveFarm}
            onSavePlot={handleSavePlot}
            onSelectCrop={setSelectedCropId}
            onNavigate={setActivePage}
          />
        )}

        {activePage === 'devices' && (
          <DevicesPage
            devices={devices}
            farms={farms}
            plots={plots}
            onSaveDevice={handleSaveDevice}
            onPingDevice={handlePingDevice}
            onSimulateAllNodes={handleSimulateAllNodes}
          />
        )}

        {activePage === 'profile' && (
          <ProfilePage
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onResetAllDemoData={handleResetAllDemoData}
          />
        )}
      </SidebarLayout>

      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
