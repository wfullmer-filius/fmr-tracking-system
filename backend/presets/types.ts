export interface FilterPreset {
  id: number;
  name: string;
  filters: PresetFilters;
  createdAt: Date;
  updatedAt: Date;
}

export interface PresetFilters {
  search?: string;
  statusFilter?: string;
  programFilter?: string;
  unitFilter?: string;
  pointOfFailureFilter?: string;
  repairActionFilter?: string;
  tierLevelFilter?: string;
}

export interface CreatePresetRequest {
  name: string;
  filters: PresetFilters;
}

export interface UpdatePresetRequest {
  id: number;
  name?: string;
  filters?: PresetFilters;
}

export interface ListPresetsResponse {
  presets: FilterPreset[];
}