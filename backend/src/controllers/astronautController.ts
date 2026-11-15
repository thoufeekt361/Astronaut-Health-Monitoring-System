import { Request, Response } from 'express';
import { Astronaut } from '../models/Astronaut';

export const getAstronauts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { missionId, status } = req.query;
    const filter: any = {};
    if (missionId) filter.missionId = missionId;
    if (status) filter.status = status;

    const astronauts = await Astronaut.find(filter).sort({ astronautId: 1 });
    res.json({ success: true, data: astronauts });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAstronautById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const astronaut = await Astronaut.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { astronautId: id }],
    });

    if (!astronaut) {
      res.status(404).json({ success: false, message: 'Astronaut not found' });
      return;
    }
    res.json({ success: true, data: astronaut });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createAstronaut = async (req: Request, res: Response): Promise<void> => {
  try {
    const existing = await Astronaut.findOne({ astronautId: req.body.astronautId });
    if (existing) {
      res.status(400).json({ success: false, message: 'Astronaut ID already exists in flight roster' });
      return;
    }

    const astronaut = await Astronaut.create(req.body);
    res.status(201).json({ success: true, data: astronaut });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateAstronaut = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const astronaut = await Astronaut.findOneAndUpdate(
      { $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { astronautId: id }] },
      req.body,
      { new: true, runValidators: true }
    );

    if (!astronaut) {
      res.status(404).json({ success: false, message: 'Astronaut not found' });
      return;
    }
    res.json({ success: true, data: astronaut });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteAstronaut = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const astronaut = await Astronaut.findOneAndDelete({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { astronautId: id }],
    });

    if (!astronaut) {
      res.status(404).json({ success: false, message: 'Astronaut not found' });
      return;
    }
    res.json({ success: true, message: 'Astronaut decommissioned from active roster' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
