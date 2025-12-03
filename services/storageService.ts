import { LogsMap } from '../types';

const STORAGE_KEY = 'hybrid_workout_logs_v2';
const ORDER_KEY = 'hybrid_workout_order_v1';

export const getStoredLogs = (): LogsMap => {
  try {
    const savedLogs = localStorage.getItem(STORAGE_KEY);
    return savedLogs ? JSON.parse(savedLogs) : {};
  } catch (error) {
    console.error("Failed to parse workout logs", error);
    return {};
  }
};

export const saveStoredLogs = (logs: LogsMap): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch (error) {
    console.error("Failed to save workout logs", error);
  }
};

export const clearStoredLogs = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ORDER_KEY);
  } catch (error) {
    console.error("Failed to clear logs", error);
  }
};

export const getStoredOrder = (): Record<string, string[]> => {
  try {
    const savedOrder = localStorage.getItem(ORDER_KEY);
    return savedOrder ? JSON.parse(savedOrder) : {};
  } catch (error) {
    console.error("Failed to parse exercise order", error);
    return {};
  }
};

export const saveStoredOrder = (order: Record<string, string[]>): void => {
  try {
    localStorage.setItem(ORDER_KEY, JSON.stringify(order));
  } catch (error) {
    console.error("Failed to save exercise order", error);
  }
};