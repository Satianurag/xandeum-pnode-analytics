import type { AlertConfig, Alert, AlertChannel } from '@/types/pnode';

const ALERTS_STORAGE_KEY = 'xandeum_alert_configs';
const ALERT_HISTORY_KEY = 'xandeum_alert_history';

export function getAlertConfigs(): AlertConfig[] {
  if (typeof window === 'undefined') return getDefaultAlertConfigs();
  
  const stored = localStorage.getItem(ALERTS_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return getDefaultAlertConfigs();
    }
  }
  return getDefaultAlertConfigs();
}

export function saveAlertConfigs(configs: AlertConfig[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(configs));
}

export function getAlertHistory(): Alert[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(ALERT_HISTORY_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
}

export function saveAlert(alert: Alert): void {
  if (typeof window === 'undefined') return;
  const history = getAlertHistory();
  history.unshift(alert);
  if (history.length > 100) history.pop();
  localStorage.setItem(ALERT_HISTORY_KEY, JSON.stringify(history));
}

export function acknowledgeAlert(alertId: string): void {
  if (typeof window === 'undefined') return;
  const history = getAlertHistory();
  const alert = history.find(a => a.id === alertId);
  if (alert) {
    alert.acknowledged = true;
    localStorage.setItem(ALERT_HISTORY_KEY, JSON.stringify(history));
  }
}

export function clearAlertHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ALERT_HISTORY_KEY);
}

export function getDefaultAlertConfigs(): AlertConfig[] {
  return [
    {
      id: 'alert_uptime_low',
      name: 'Low Uptime Alert',
      enabled: true,
      type: 'uptime',
      condition: 'below',
      threshold: 95,
      severity: 'warning',
      channels: [{ type: 'in_app', enabled: true }],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'alert_uptime_critical',
      name: 'Critical Uptime Alert',
      enabled: true,
      type: 'uptime',
      condition: 'below',
      threshold: 80,
      severity: 'critical',
      channels: [{ type: 'in_app', enabled: true }],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'alert_latency_high',
      name: 'High Latency Alert',
      enabled: true,
      type: 'latency',
      condition: 'above',
      threshold: 200,
      severity: 'warning',
      channels: [{ type: 'in_app', enabled: true }],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'alert_score_low',
      name: 'Low Performance Score',
      enabled: true,
      type: 'score',
      condition: 'below',
      threshold: 50,
      severity: 'warning',
      channels: [{ type: 'in_app', enabled: true }],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'alert_commission_change',
      name: 'Commission Change Alert',
      enabled: true,
      type: 'commission',
      condition: 'above',
      threshold: 0,
      severity: 'info',
      channels: [{ type: 'in_app', enabled: true }],
      createdAt: new Date().toISOString(),
    },
  ];
}

export function createAlertConfig(config: Omit<AlertConfig, 'id' | 'createdAt'>): AlertConfig {
  const newConfig: AlertConfig = {
    ...config,
    id: `alert_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  
  const configs = getAlertConfigs();
  configs.push(newConfig);
  saveAlertConfigs(configs);
  
  return newConfig;
}

export function updateAlertConfig(id: string, updates: Partial<AlertConfig>): AlertConfig | null {
  const configs = getAlertConfigs();
  const index = configs.findIndex(c => c.id === id);
  
  if (index === -1) return null;
  
  configs[index] = { ...configs[index], ...updates };
  saveAlertConfigs(configs);
  
  return configs[index];
}

export function deleteAlertConfig(id: string): boolean {
  const configs = getAlertConfigs();
  const filtered = configs.filter(c => c.id !== id);
  
  if (filtered.length === configs.length) return false;
  
  saveAlertConfigs(filtered);
  return true;
}

export async function sendWebhook(url: string, alert: Alert): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `**${alert.title}**\n${alert.message}\nSeverity: ${alert.severity}\nValue: ${alert.value} (Threshold: ${alert.threshold})`,
        embeds: [{
          title: alert.title,
          description: alert.message,
          color: alert.severity === 'critical' ? 0xff0000 : alert.severity === 'warning' ? 0xffaa00 : 0x00ff00,
          fields: [
            { name: 'Severity', value: alert.severity, inline: true },
            { name: 'Value', value: String(alert.value), inline: true },
            { name: 'Threshold', value: String(alert.threshold), inline: true },
          ],
          timestamp: alert.timestamp,
        }],
      }),
    });
    return response.ok;
  } catch (error) {
    console.error('Webhook error:', error);
    return false;
  }
}

export function checkAlertCondition(
  config: AlertConfig,
  value: number
): boolean {
  switch (config.condition) {
    case 'above':
      return value > config.threshold;
    case 'below':
      return value < config.threshold;
    case 'equals':
      return Math.abs(value - config.threshold) < 0.001;
    default:
      return false;
  }
}

export function createAlert(
  config: AlertConfig,
  value: number,
  nodeId?: string,
  nodePubkey?: string
): Alert {
  const alert: Alert = {
    id: `alert_instance_${Date.now()}`,
    configId: config.id,
    title: config.name,
    message: `${config.type} is ${config.condition} threshold: ${value.toFixed(2)} (threshold: ${config.threshold})`,
    severity: config.severity,
    nodeId,
    nodePubkey,
    value,
    threshold: config.threshold,
    timestamp: new Date().toISOString(),
    acknowledged: false,
  };
  
  saveAlert(alert);
  return alert;
}
