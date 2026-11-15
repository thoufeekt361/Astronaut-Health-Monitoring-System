import React, { useState, useEffect } from 'react';
import { missionService } from '../services/missions';
import { astronautService } from '../services/astronauts';
import { Mission, Astronaut, MissionStatus } from '../types';
import { Compass, Plus, Calendar, Users, Activity, Edit2, Trash2, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export const Missions: React.FC = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [astronauts, setAstronauts] = useState<Astronaut[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingMission, setEditingMission] = useState<Mission | null>(null);

  const [formData, setFormData] = useState({
    missionId: '',
    missionName: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'Active' as MissionStatus,
    astronautIds: [] as string[],
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [miss, astros] = await Promise.all([
        missionService.getAll(),
        astronautService.getAll().catch(() => []),
      ]);
      setMissions(miss);
      setAstronauts(astros);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load missions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingMission(null);
    setFormData({
      missionId: `MIS-ARTEMIS-${missions.length + 6}`,
      missionName: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Active',
      astronautIds: [],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (m: Mission) => {
    setEditingMission(m);
    setFormData({
      missionId: m.missionId,
      missionName: m.missionName,
      description: m.description,
      startDate: m.startDate ? m.startDate.split('T')[0] : '',
      endDate: m.endDate ? m.endDate.split('T')[0] : '',
      status: m.status,
      astronautIds: m.astronautIds || [],
    });
    setIsModalOpen(true);
  };

  const handleToggleAstronaut = (astroId: string) => {
    setFormData((prev) => {
      const exists = prev.astronautIds.includes(astroId);
      return {
        ...prev,
        astronautIds: exists
          ? prev.astronautIds.filter((id) => id !== astroId)
          : [...prev.astronautIds, astroId],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMission && (editingMission._id || editingMission.missionId)) {
        const idToUpdate = editingMission._id || editingMission.missionId;
        await missionService.update(idToUpdate, formData);
        toast.success(`Mission ${formData.missionName} updated`);
      } else {
        await missionService.create(formData);
        toast.success(`Mission ${formData.missionName} registered`);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error saving mission';
      toast.error(msg);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Decommission mission ${name}?`)) {
      try {
        await missionService.delete(id);
        toast.success(`Mission ${name} deleted`);
        loadData();
      } catch {
        toast.error('Failed to delete mission');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-space-border">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide flex items-center space-x-2">
            <Compass className="w-5 h-5 text-indigo-400" />
            <span>Deep Space Operations & Mission Management</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            ORBITAL FLIGHT PLANS, CREW ASSIGNMENTS, AND ENVIRONMENTAL CONTEXT
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-3.5 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-medium flex items-center space-x-2 shadow-glow-primary transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Charter Mission</span>
        </button>
      </div>

      {/* Missions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {missions.map((m) => (
          <div
            key={m.missionId}
            className="glass-panel p-6 rounded-2xl border border-space-border hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {m.missionId}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1.5">{m.missionName}</h3>
                </div>

                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    m.status === 'Active'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : m.status === 'Scheduled'
                      ? 'bg-sky-500/20 text-sky-400 border-sky-500/30'
                      : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                  }`}
                >
                  {m.status}
                </span>
              </div>

              <p className="text-xs text-slate-300 mt-2 leading-relaxed">{m.description}</p>

              {/* Dates */}
              <div className="mt-4 flex items-center space-x-4 text-xs font-mono text-slate-400">
                <div className="flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-sky-400" />
                  <span>Start: {m.startDate ? new Date(m.startDate).toLocaleDateString() : 'TBD'}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <span>End: {m.endDate ? new Date(m.endDate).toLocaleDateString() : 'TBD'}</span>
                </div>
              </div>

              {/* Crew Roster in Mission */}
              <div className="mt-4 pt-3 border-t border-slate-800">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-2">
                  Assigned Crew ({(m.astronautIds || []).length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(m.astronautIds || []).map((id) => {
                    const astro = astronauts.find((a) => a.astronautId === id);
                    return (
                      <span
                        key={id}
                        className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300 flex items-center space-x-1"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>{astro ? `${id} (${astro.name.split(' ')[0]})` : id}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-[11px] text-slate-400">Telemetry Sync: 100% OK</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => openEditModal(m)}
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-sky-400 transition-colors"
                  title="Edit Mission"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(m._id || m.missionId, m.missionName)}
                  className="p-1.5 rounded hover:bg-rose-950/30 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Decommission"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-panel p-6 rounded-2xl border border-space-border w-full max-w-lg relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-semibold text-white">
                {editingMission ? 'Modify Flight Directive' : 'Register Space Mission'}
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
                  <label className="block text-slate-400 mb-1">Mission ID</label>
                  <input
                    type="text"
                    required
                    value={formData.missionId}
                    onChange={(e) => setFormData({ ...formData, missionId: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as MissionStatus })}
                    className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Aborted">Aborted</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Mission Title</label>
                <input
                  type="text"
                  required
                  value={formData.missionName}
                  onChange={(e) => setFormData({ ...formData, missionName: e.target.value })}
                  placeholder="e.g. Artemis VI Mars Transit"
                  className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Objective & Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-sky-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Assign Astronauts */}
              <div>
                <label className="block text-slate-400 mb-1">Select Crew Members</label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 rounded bg-slate-900 border border-slate-800">
                  {astronauts.map((astro) => {
                    const isSelected = formData.astronautIds.includes(astro.astronautId);
                    return (
                      <button
                        type="button"
                        key={astro.astronautId}
                        onClick={() => handleToggleAstronaut(astro.astronautId)}
                        className={`px-2 py-1.5 rounded text-[10px] text-left transition-colors flex items-center justify-between ${
                          isSelected ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        <span>{astro.name} ({astro.astronautId})</span>
                        {isSelected && <Check className="w-3 h-3 text-sky-400" />}
                      </button>
                    );
                  })}
                </div>
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
                  className="px-4 py-2 rounded bg-sky-500 hover:bg-sky-400 text-white font-bold"
                >
                  Save Mission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
