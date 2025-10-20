export interface ColumnPreset {
  id: number;
  name: string;
  columns: string[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateColumnPresetRequest {
  name: string;
  columns: string[];
  isDefault?: boolean;
}

export interface UpdateColumnPresetRequest {
  id: number;
  name?: string;
  columns?: string[];
  isDefault?: boolean;
}

export interface ListColumnPresetsResponse {
  presets: ColumnPreset[];
}
