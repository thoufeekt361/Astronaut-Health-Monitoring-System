import React, { createContext, useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket, disconnectSocket } from '../services/socket';
import { useAuth } from './AuthContext';
import { HealthReading, Alert, Prediction } from '../types';
import toast from 'react-hot-toast';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  latestReading: HealthReading | null;
  recentAlert: Alert | null;
  recentAnomaly: Prediction | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [latestReading, setLatestReading] = useState<HealthReading | null>(null);
  const [recentAlert, setRecentAlert] = useState<Alert | null>(null);
  const [recentAnomaly, setRecentAnomaly] = useState<Prediction | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socket) {
        disconnectSocket();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const socketInstance = getSocket();
    setSocket(socketInstance);

    const onConnect = () => {
      setIsConnected(true);
      console.log('[Socket.IO] Connected to Mission Control Gateway');
    };

    const onDisconnect = () => {
      setIsConnected(false);
      console.log('[Socket.IO] Disconnected from Mission Control Gateway');
    };

    const onHealthUpdate = (data: HealthReading) => {
      setLatestReading(data);
    };

    const onNewAlert = (alert: Alert) => {
      setRecentAlert(alert);
      if (alert.severity === 'Critical') {
        toast.error(`CRITICAL ALERT: ${alert.title} [${alert.astronautId}]`, {
          duration: 6000,
          position: 'top-right',
          style: {
            background: '#450a0a',
            color: '#fecaca',
            border: '1px solid #dc2626',
          },
        });
      } else if (alert.severity === 'Warning') {
        toast(`WARNING: ${alert.title} [${alert.astronautId}]`, {
          duration: 5000,
          icon: '⚠️',
          style: {
            background: '#451a03',
            color: '#fef08a',
            border: '1px solid #d97706',
          },
        });
      }
    };

    const onMlAnomaly = (prediction: Prediction) => {
      setRecentAnomaly(prediction);
      if (prediction.isAnomaly) {
        toast(`AI Anomaly Flagged: ${prediction.astronautId}`, {
          icon: '🧠',
          duration: 5000,
          style: {
            background: '#2e1065',
            color: '#e9d5ff',
            border: '1px solid #9333ea',
          },
        });
      }
    };

    socketInstance.on('connect', onConnect);
    socketInstance.on('disconnect', onDisconnect);
    socketInstance.on('health:update', onHealthUpdate);
    socketInstance.on('alert:new', onNewAlert);
    socketInstance.on('ml:anomaly', onMlAnomaly);

    if (socketInstance.connected) {
      setIsConnected(true);
    }

    return () => {
      socketInstance.off('connect', onConnect);
      socketInstance.off('disconnect', onDisconnect);
      socketInstance.off('health:update', onHealthUpdate);
      socketInstance.off('alert:new', onNewAlert);
      socketInstance.off('ml:anomaly', onMlAnomaly);
    };
  }, [isAuthenticated, token]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        latestReading,
        recentAlert,
        recentAnomaly,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
