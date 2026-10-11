import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Lock, UserCheck, Sprout } from 'lucide-react';
import { PageId, UserProfile } from '../types/smartfarm';
import { ResilientImage } from '../components/UiPrimitives';
import { VISUAL_ASSETS } from '../data/mockData';

interface LoginPageProps {
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onNavigate: (page: PageId) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  profile,
  onUpdateProfile,
  onNavigate,
}) => {
  const [emailInput, setEmailInput] = useState(profile.email);
  const [passwordInput, setPasswordInput] = useState('••••••••••••');
  const [selectedPreset, setSelectedPreset] = useState<'student' | 'professor' | 'agronomist'>(
    'student'
  );
  const [feedback, setFeedback] = useState<string | null>(null);

  const applyPresetAndEnter = (role: 'student' | 'professor' | 'agronomist') => {
    setSelectedPreset(role);
    if (role === 'student') {
      onUpdateProfile({
        fullName: 'Aarav Sharma',
        roleTitle: 'Final-Year B.Tech Capstone Presenter',
        email: 'aarav.sharma.demo@college.edu',
      });
    } else if (role === 'professor') {
      onUpdateProfile({
        fullName: 'Prof. M. K. Verma',
        roleTitle: 'Faculty Project Evaluator (Demo Reviewer)',
        email: 'prof.verma.eval@college.edu',
      });
    } else {
      onUpdateProfile({
        fullName: 'Dr. R. Nair',
        roleTitle: 'Research Farm Agronomist (Demo Mode)',
        email: 'r.nair.agronomy@college.edu',
      });
    }
    setFeedback('Demo Mode session initialized locally. Opening Analytics Dashboard...');
    setTimeout(() => {
      onNavigate('dashboard');
    }, 180);
  };

  const handleManualDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({ email: emailInput });
    onNavigate('dashboard');
  };

  return (
    <div className="max-w-5xl mx-auto py-2">
      <div className="bg-white rounded-2xl border border-[#DCE4DF] overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-xs">
        {/* Left 5 Columns: Split-Screen Agricultural Photography & Context */}
        <div className="lg:col-span-5 relative min-h-[320px] lg:min-h-[540px] flex flex-col justify-between p-7 text-white overflow-hidden">
          <ResilientImage
            src={VISUAL_ASSETS.loginSplit}
            alt="Precision agronomy greenhouse with wireless soil moisture and NPK sensors"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#092E1D]/95 via-[#0F4C31]/70 to-[#092E1D]/60" />

          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-[#A3E635]">
              <Sprout className="w-4 h-4" />
              <span>FRONTEND DEMO MODE · NO BACKEND AUTH</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              SmartFarm Precision Agronomy Portal
            </h1>
            <p className="text-xs sm:text-sm text-[#D8E8DF] leading-relaxed">
              Designed for reliable academic demonstration. No external credentials, API keys, or
              database servers are required—all telemetry simulations and farm records run in
              browser state.
            </p>
          </div>

          <div className="relative z-10 pt-5 border-t border-white/20 space-y-1.5 text-xs">
            <div className="text-[#A3E635] font-semibold">Active Session Identity</div>
            <div className="font-bold text-white">{profile.fullName}</div>
            <div className="text-[#D8E8DF]">{profile.roleTitle}</div>
            <div className="font-mono-tabular text-[#A3E635] text-[11px]">{profile.email}</div>
          </div>
        </div>

        {/* Right 7 Columns: Interactive Demo Entry & Persona Switcher */}
        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#0F1E16]">
                One-Click Demo Mode Entry
              </h2>
              <p className="text-xs sm:text-sm text-[#4A5D52] mt-1">
                Select an evaluation persona below or click <strong>Enter Demo Mode</strong> to
                explore the full precision-agriculture platform immediately.
              </p>
            </div>

            {/* Highlighted Demo Entry Box */}
            <div className="p-5 rounded-2xl bg-[#F6F7F3] border border-[#C5D6CC] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0F4C31]">
                  INSTANT EVALUATION ACCESS
                </span>
                <span className="text-xs font-mono-tabular text-[#4A5D52]">
                  Zero Configuration
                </span>
              </div>

              <button
                type="button"
                onClick={() => applyPresetAndEnter(selectedPreset)}
                className="w-full py-3.5 px-5 bg-[#0F4C31] hover:bg-[#145A3A] text-white font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <UserCheck className="w-4 h-4 text-[#A3E635]" />
                <span>ENTER DEMO MODE (OPEN DASHBOARD)</span>
                <ArrowRight className="w-4 h-4 text-[#A3E635]" />
              </button>

              <div className="space-y-2 pt-1">
                <div className="text-xs font-medium text-[#4A5D52]">
                  Choose Demo Evaluation Persona:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    {
                      id: 'student' as const,
                      title: 'Student Lead',
                      sub: 'Aarav Sharma (B.Tech)',
                    },
                    {
                      id: 'professor' as const,
                      title: 'Professor Evaluator',
                      sub: 'Prof. M. K. Verma',
                    },
                    {
                      id: 'agronomist' as const,
                      title: 'Farm Agronomist',
                      sub: 'Dr. R. Nair',
                    },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => applyPresetAndEnter(p.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedPreset === p.id
                          ? 'bg-white border-[#0F4C31] ring-1 ring-[#0F4C31]'
                          : 'bg-white/70 border-[#DCE4DF] hover:border-[#145A3A]'
                      }`}
                    >
                      <div className="text-xs font-bold text-[#0F1E16]">{p.title}</div>
                      <div className="text-[11px] text-[#4A5D52] truncate mt-0.5">{p.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {feedback && (
              <div className="p-3.5 rounded-xl bg-[#E8F3EC] border border-[#237A4B] text-xs text-[#0F4C31] font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{feedback}</span>
              </div>
            )}

            {/* Standard Credential Form Mockup */}
            <form
              onSubmit={handleManualDemoSubmit}
              className="space-y-4 pt-4 border-t border-[#E6ECE8]"
            >
              <div className="text-xs font-bold text-[#4A5D52]">
                Institutional Sign-In Preview (Simulated Local Only)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-[#0F1E16] mb-1">
                    Academic Email
                  </label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-[#C5D6CC] rounded-xl focus:outline-none focus:border-[#145A3A]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#0F1E16] mb-1">
                    Password (Ignored in Demo)
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-white border border-[#C5D6CC] rounded-xl focus:outline-none focus:border-[#145A3A]"
                    />
                    <Lock className="w-3.5 h-3.5 text-[#4A5D52] absolute right-3 top-2.5" />
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#1D7049] hover:bg-[#145A3A] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Continue with Mock Credentials
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
