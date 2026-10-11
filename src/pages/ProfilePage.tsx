import React, { useState, useEffect } from 'react';
import { CheckCircle2, RotateCcw, User } from 'lucide-react';
import { UserProfile } from '../types/smartfarm';

interface ProfilePageProps {
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onResetAllDemoData: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  profile,
  onUpdateProfile,
  onResetAllDemoData,
}) => {
  const [formState, setFormState] = useState<UserProfile>(profile);
  const [savedBanner, setSavedBanner] = useState<string | null>(null);

  useEffect(() => {
    setFormState(profile);
  }, [profile]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formState);
    setSavedBanner(
      'Profile settings and measurement units updated locally across all charts and tables.'
    );
    setTimeout(() => setSavedBanner(null), 3500);
  };

  const handleReset = () => {
    onResetAllDemoData();
    setSavedBanner(
      'All farms, crops, sensor logs, devices, and alerts reset to initial demo defaults.'
    );
    setTimeout(() => setSavedBanner(null), 3500);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="bg-white rounded-2xl border border-[#DCE4DF] p-5 lg:p-6">
        <div className="text-xs font-bold text-[#145A3A]">
          PRESENTER IDENTITY & LOCAL SESSION CONFIGURATION
        </div>
        <h1 className="text-2xl font-bold text-[#0F1E16] tracking-tight mt-0.5">
          Presenter Profile & Prototype Preferences
        </h1>
        <p className="text-xs text-[#4A5D52] mt-0.5">
          Changes made here update local React state immediately across all dashboard charts and
          tables.
        </p>
      </div>

      {savedBanner && (
        <div className="p-4 rounded-2xl bg-[#E8F3EC] border border-[#237A4B] text-xs text-[#0F4C31] font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{savedBanner}</span>
        </div>
      )}

      <form
        onSubmit={handleSave}
        className="bg-white rounded-2xl border border-[#DCE4DF] p-6 space-y-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E6ECE8] pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#0F4C31] text-[#A3E635] flex items-center justify-center font-bold text-sm">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-bold text-[#0F1E16]">{profile.fullName}</div>
              <div className="text-xs text-[#4A5D52]">
                {profile.roleTitle} · {profile.studentId}
              </div>
            </div>
          </div>

          <span className="text-xs font-mono-tabular text-[#145A3A] font-semibold">
            LOCAL SESSION STATE
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-medium text-[#0F1E16] mb-1">
              Presenter / Reviewer Full Name
            </label>
            <input
              type="text"
              value={formState.fullName}
              onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
              className="w-full px-3.5 py-2 border border-[#C5D6CC] rounded-xl"
            />
          </div>

          <div>
            <label className="block font-medium text-[#0F1E16] mb-1">
              Academic Role / Title
            </label>
            <input
              type="text"
              value={formState.roleTitle}
              onChange={(e) => setFormState({ ...formState, roleTitle: e.target.value })}
              className="w-full px-3.5 py-2 border border-[#C5D6CC] rounded-xl"
            />
          </div>

          <div>
            <label className="block font-medium text-[#0F1E16] mb-1">
              Student / Project ID
            </label>
            <input
              type="text"
              value={formState.studentId}
              onChange={(e) => setFormState({ ...formState, studentId: e.target.value })}
              className="w-full px-3.5 py-2 border border-[#C5D6CC] rounded-xl font-mono-tabular"
            />
          </div>

          <div>
            <label className="block font-medium text-[#0F1E16] mb-1">
              Faculty Evaluator / Advisor Name
            </label>
            <input
              type="text"
              value={formState.advisorName}
              onChange={(e) => setFormState({ ...formState, advisorName: e.target.value })}
              className="w-full px-3.5 py-2 border border-[#C5D6CC] rounded-xl"
            />
          </div>

          <div>
            <label className="block font-medium text-[#0F1E16] mb-1">Department</label>
            <input
              type="text"
              value={formState.department}
              onChange={(e) => setFormState({ ...formState, department: e.target.value })}
              className="w-full px-3.5 py-2 border border-[#C5D6CC] rounded-xl"
            />
          </div>

          <div>
            <label className="block font-medium text-[#0F1E16] mb-1">
              College / Institution
            </label>
            <input
              type="text"
              value={formState.institution}
              onChange={(e) => setFormState({ ...formState, institution: e.target.value })}
              className="w-full px-3.5 py-2 border border-[#C5D6CC] rounded-xl"
            />
          </div>
        </div>

        {/* Unit Preferences */}
        <div className="pt-4 border-t border-[#E6ECE8] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-medium text-[#0F1E16] mb-1.5">
              Temperature Display Unit
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFormState({ ...formState, tempUnit: 'C' })}
                className={`px-4 py-2 rounded-xl font-semibold border transition-colors cursor-pointer ${
                  formState.tempUnit === 'C'
                    ? 'bg-[#0F4C31] text-white border-[#0F4C31]'
                    : 'bg-[#F6F7F3] text-[#4A5D52] border-[#DCE4DF]'
                }`}
              >
                Celsius (°C)
              </button>
              <button
                type="button"
                onClick={() => setFormState({ ...formState, tempUnit: 'F' })}
                className={`px-4 py-2 rounded-xl font-semibold border transition-colors cursor-pointer ${
                  formState.tempUnit === 'F'
                    ? 'bg-[#0F4C31] text-white border-[#0F4C31]'
                    : 'bg-[#F6F7F3] text-[#4A5D52] border-[#DCE4DF]'
                }`}
              >
                Fahrenheit (°F)
              </button>
            </div>
          </div>

          <div>
            <label className="block font-medium text-[#0F1E16] mb-1.5">
              Land Area Measurement Unit
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFormState({ ...formState, areaUnit: 'ha' })}
                className={`px-4 py-2 rounded-xl font-semibold border transition-colors cursor-pointer ${
                  formState.areaUnit === 'ha'
                    ? 'bg-[#0F4C31] text-white border-[#0F4C31]'
                    : 'bg-[#F6F7F3] text-[#4A5D52] border-[#DCE4DF]'
                }`}
              >
                Hectares (ha)
              </button>
              <button
                type="button"
                onClick={() => setFormState({ ...formState, areaUnit: 'acres' })}
                className={`px-4 py-2 rounded-xl font-semibold border transition-colors cursor-pointer ${
                  formState.areaUnit === 'acres'
                    ? 'bg-[#0F4C31] text-white border-[#0F4C31]'
                    : 'bg-[#F6F7F3] text-[#4A5D52] border-[#DCE4DF]'
                }`}
              >
                Acres (ac)
              </button>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[#E6ECE8] flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 text-xs font-semibold text-[#B45309] bg-[#FEF3C7] hover:bg-[#FDE68A] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Demo Data to Initial Defaults</span>
          </button>

          <button
            type="submit"
            className="px-5 py-2.5 text-xs font-semibold bg-[#0F4C31] hover:bg-[#145A3A] text-white rounded-xl transition-colors cursor-pointer"
          >
            Save Session Profile Settings
          </button>
        </div>
      </form>
    </div>
  );
};
