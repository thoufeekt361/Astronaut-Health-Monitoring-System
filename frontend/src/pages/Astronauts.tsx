import React, { useState, useEffect } from 'react';
import { astronautService } from '../services/astronauts';
import { missionService } from '../services/missions';
import { Astronaut, Mission, AstronautStatus } from '../types';
import { Users, UserPlus, Edit2, Trash2, Shield, HeartPulse, Search, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export const Astronauts: React.FC = () => {
  const [astronauts, setAstronauts] = useState<Astronaut[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingAstro, setEditingAstro] = useState<Astronaut | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    astronautId: '',
    name: '',
    age: 35,
    gender: 'Female',
    country: 'United States',
    role: 'Flight Engineer',
    missionId: 'MIS-ARTEMIS-VI',
    status: 'Healthy' as AstronautStatus,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [astros, miss] = await Promise.all([
        astronautService.getAll(),
        missionService.getAll().catch(() => []),
      ]);
      setAstronauts(astros);
      setMissions(miss);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load astronauts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingAstro(null);
    setFormData({
      astronautId: `AST-00${astronauts.length + 1}`,
      name: '',
      age: 36,
      gender: 'Male',
      country: 'United States',
      role: 'Payload Specialist',
      missionId: missions[0]?.missionId || 'MIS-ARTEMIS-VI',
      status: 'Healthy',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (astro: Astronaut) => {
    setEditingAstro(astro);
    setFormData({
      astronautId: astro.astronautId,
      name: astro.name,
      age: astro.age,
      gender: astro.gender || 'Female',
      country: astro.country,
      role: astro.role,
      missionId: astro.missionId,
      status: astro.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAstro && (editingAstro._id || editingAstro.astronautId)) {
        const idToUpdate = editingAstro._id || editingAstro.astronautId;
        await astronautService.update(idToUpdate, formData);
        toast.success(`Astronaut ${formData.name} updated`);
      } else {
        await astronautService.create(formData);
        toast.success(`Astronaut ${formData.name} added to roster`);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error saving astronaut';
      toast.error(msg);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Remove astronaut ${name} from active flight roster?`)) {
      try {
        await astronautService.delete(id);
        toast.success(`Astronaut ${name} removed`);
        loadData();
      } catch {
        toast.error('Failed to delete astronaut');
      }
    }
  };

  const filteredAstronauts = astronauts.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.astronautId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-space-border">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide flex items-center space-x-2">
            <Users className="w-5 h-5 text-sky-400" />
            <span>Active Astronaut Roster & Medical Profiles</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            CREW BIOGRAPHICAL & MISSION ASSIGNMENT REPOSITORY
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-3.5 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-medium flex items-center space-x-2 shadow-glow-primary transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Induct Astronaut</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel p-4 rounded-xl border border-space-border flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, ID, role..."
            className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-slate-900/90 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto">
          {['ALL', 'Healthy', 'Warning', 'Critical', 'Off-duty'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                statusFilter === st
                  ? 'bg-sky-500 text-white font-semibold'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Astronauts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAstronauts.map((astro) => (
          <div
            key={astro.astronautId}
            className="glass-panel p-5 rounded-2xl border border-space-border hover:border-sky-500/40 transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-700 border border-sky-400/30 flex items-center justify-center font-mono font-bold text-lg text-white shadow-glow-primary">
                    {astro.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{astro.name}</h3>
                    <div className="text-[11px] font-mono text-sky-400">{astro.astronautId}</div>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    astro.status === 'Healthy'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : astro.status === 'Warning'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {astro.status}
                </span>
              </div>

              {/* Attributes */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">ROLE</span>
                  <span className="text-slate-200 truncate block">{astro.role}</span>
                </div>
                <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">COUNTRY</span>
                  <span className="text-slate-200 truncate block">{astro.country}</span>
                </div>
                <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">AGE</span>
                  <span className="text-slate-200">{astro.age} yrs</span>
                </div>
                <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">MISSION</span>
                  <span className="text-sky-300 truncate block">{astro.missionId}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
              <a
                href={`/monitoring?astronaut=${astro.astronautId}`}
                className="text-sky-400 hover:text-sky-300 flex items-center space-x-1"
              >
                <HeartPulse className="w-3.5 h-3.5" />
                <span>Live Telemetry</span>
              </a>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => openEditModal(astro)}
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-sky-400 transition-colors"
                  title="Edit details"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(astro._id || astro.astronautId, astro.name)}
                  className="p-1.5 rounded hover:bg-rose-950/30 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Astronaut Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-panel p-6 rounded-2xl border border-space-border w-full max-w-lg relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-semibold text-white">
                {editingAstro ? 'Edit Astronaut Profile' : 'Induct New Astronaut'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Astronaut ID</label>
                  <input
                    type="text"
                    required
                    value={formData.astronautId}
                    onChange={(e) => setFormData({ ...formData, astronautId: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Commander John Doe"
                    className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Age</label>
                  <input
                    type="number"
                    required
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Non-Binary">Non-Binary</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Country</label>
                  <input
                    type="text"
                    required
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Mission Assignment</label>
                  <input
                    type="text"
                    value={formData.missionId}
                    onChange={(e) => setFormData({ ...formData, missionId: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Role</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Health Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as AstronautStatus })}
                  className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="Healthy">Healthy (Nominal)</option>
                  <option value="Warning">Warning (Observation)</option>
                  <option value="Critical">Critical (Immediate Care)</option>
                  <option value="Off-duty">Off-duty / Resting</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-sky-500 hover:bg-sky-400 text-white font-bold flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
