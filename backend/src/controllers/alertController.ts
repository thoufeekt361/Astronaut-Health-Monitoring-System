import { Request, Response } from 'express';
import { Alert } from '../models/Alert';
import { getIO } from '../sockets/socketHandler';

export const getAlerts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { severity, status, astronautId, limit = 50 } = req.query;
    const filter: any = {};
    if (severity && severity !== 'ALL') filter.severity = severity;
    if (status && status !== 'ALL') filter.status = status;
    if (astronautId && astronautId !== 'ALL') filter.astronautId = astronautId;

    const alerts = await Alert.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string, 10));

    res.json({ success: true, data: alerts });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAlertById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const alert = await Alert.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { alertId: id }],
    });

    if (!alert) {
      res.status(404).json({ success: false, message: 'Alert not found' });
      return;
    }
    res.json({ success: true, data: alert });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createAlert = async (req: Request, res: Response): Promise<void> => {
  try {
    const alert = await Alert.create({
      ...req.body,
      alertId: req.body.alertId || `ALT-${Date.now().toString().slice(-6)}`,
    });

    const io = getIO();
    if (io) {
      io.emit('alert:new', alert);
    }

    res.status(201).json({ success: true, data: alert });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateAlert = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const alert = await Alert.findOneAndUpdate(
      { $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { alertId: id }] },
      req.body,
      { new: true }
    );

    if (!alert) {
      res.status(404).json({ success: false, message: 'Alert not found' });
      return;
    }

    const io = getIO();
    if (io) {
      io.emit('alert:updated', alert);
    }

    res.json({ success: true, data: alert });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const acknowledgeAlert = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const alert = await Alert.findOneAndUpdate(
      { $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { alertId: id }] },
      { status: 'Acknowledged', acknowledgedAt: new Date() },
      { new: true }
    );

    if (!alert) {
      res.status(404).json({ success: false, message: 'Alert not found' });
      return;
    }

    const io = getIO();
    if (io) {
      io.emit('alert:updated', alert);
    }

    res.json({ success: true, data: alert });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const resolveAlert = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const alert = await Alert.findOneAndUpdate(
      { $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { alertId: id }] },
      { status: 'Resolved', resolvedAt: new Date() },
      { new: true }
    );

    if (!alert) {
      res.status(404).json({ success: false, message: 'Alert not found' });
      return;
    }

    const io = getIO();
    if (io) {
      io.emit('alert:updated', alert);
    }

    res.json({ success: true, data: alert });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAlertSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const [critical, warning, informational, total] = await Promise.all([
      Alert.countDocuments({ severity: 'Critical', status: { $ne: 'Resolved' } }),
      Alert.countDocuments({ severity: 'Warning', status: { $ne: 'Resolved' } }),
      Alert.countDocuments({ severity: 'Informational', status: { $ne: 'Resolved' } }),
      Alert.countDocuments(),
    ]);

    res.json({
      success: true,
      data: { critical, warning, informational, total },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
