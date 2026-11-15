import { Request, Response } from 'express';
import { Mission } from '../models/Mission';

export const getMissions = async (req: Request, res: Response): Promise<void> => {
  try {
    const missions = await Mission.find().sort({ startDate: -1 });
    res.json({ success: true, data: missions });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMissionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const mission = await Mission.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { missionId: id }],
    });

    if (!mission) {
      res.status(404).json({ success: false, message: 'Mission directive not found' });
      return;
    }
    res.json({ success: true, data: mission });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createMission = async (req: Request, res: Response): Promise<void> => {
  try {
    const existing = await Mission.findOne({ missionId: req.body.missionId });
    if (existing) {
      res.status(400).json({ success: false, message: 'Mission ID already logged' });
      return;
    }

    const mission = await Mission.create(req.body);
    res.status(201).json({ success: true, data: mission });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateMission = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const mission = await Mission.findOneAndUpdate(
      { $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { missionId: id }] },
      req.body,
      { new: true, runValidators: true }
    );

    if (!mission) {
      res.status(404).json({ success: false, message: 'Mission directive not found' });
      return;
    }
    res.json({ success: true, data: mission });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteMission = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const mission = await Mission.findOneAndDelete({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { missionId: id }],
    });

    if (!mission) {
      res.status(404).json({ success: false, message: 'Mission directive not found' });
      return;
    }
    res.json({ success: true, message: 'Mission cancelled and removed' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
