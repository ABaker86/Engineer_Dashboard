import React from 'react';
import { WidgetInstance, WidgetLayout } from '../types/dashboard';

export type WidgetCategory = 'metrics' | 'tracking' | 'infra' | 'mcp' | 'database';

export interface WidgetProps<TConfig = any, TData = any> {
  widget: WidgetInstance;
  config: TConfig;
  data: TData | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onUpdateConfig: (newConfig: Partial<TConfig>) => void;
  isEditMode?: boolean;
}

export interface WidgetConfigProps<TConfig = any> {
  config: TConfig;
  onChange: (newConfig: Partial<TConfig>) => void;
  availableDataSources: {
    mcp: Array<{ id: string; name: string }>;
    rest: Array<{ id: string; name: string }>;
    db: Array<{ id: string; name: string }>;
  };
}

export interface WidgetPlugin<TConfig = any, TData = any> {
  id: string;
  name: string;
  description: string;
  category: WidgetCategory;
  icon: string; // Lucide icon name
  defaultTitle: string;
  defaultSize: { w: number; h: number; minW: number; minH: number };
  defaultConfig: TConfig;
  component: React.ComponentType<WidgetProps<TConfig, TData>>;
  configComponent?: React.ComponentType<WidgetConfigProps<TConfig>>;
  mockDataGenerator?: (config: TConfig) => TData;
}
