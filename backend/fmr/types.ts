export type FMRStatus = "Draft" | "Submitted" | "Unresolved" | "In-Progress" | "Resolved" | "Archived";
export type PointOfFailure = "Receipt" | "Testing" | "Mission" | "Other";
export type RepairAction = "RMA" | "Rework" | "Scrap/New Part" | "Other";
export type Signed1149Status = "N/A" | "Waiting for Signature" | "Sign Date";
export type TierLevel = "tier1" | "tier2" | "tier3" | "none";

export interface FMRRequest {
  id: number;
  title: string;
  description?: string;
  status: FMRStatus;
  creationDate: Date;
  resolutionDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Report section
  controlNumber?: string;
  program?: string;
  unit?: string;
  ommodSn?: string;
  ommodSystemMeterHrs?: string;
  technicianName?: string;
  email?: string;
  commNumber?: string;
  dateReported?: Date;
  failedDate?: Date;
  pointOfFailure?: PointOfFailure;
  failedPartNomenclature?: string;
  failedPartNumber?: string;
  qty?: string;
  partSerialNumber?: string;
  describeFailure?: string;
  troubleShootingPerformed?: string;
  repairTechnician?: string;
  repairStartDate?: Date;
  repairActivityDescription?: string;
  
  // Processing section
  repairAction?: RepairAction;
  repairActionOther?: string;
  
  // Supply Chain section
  signed1149?: Signed1149Status;
  signed1149Date?: Date;
  failedPartReceivedDate?: Date;
  newPartReceivedDate?: Date;
  newPartIssuedDate?: Date;
  newPartSerialNumber?: string;
  supplyComments?: string;
  
  // Procurement section
  poNumber?: string;
  warrantyStartDate?: Date;
  newPartOrderedDate?: Date;
  vendorContactAddress?: string;
  procurementComments?: string;
  
  // Logistics section
  requestDate?: Date;
  requestToVendorDate?: Date;
  rmaReceivedDate?: Date;
  shippedToVendorDate?: Date;
  logisticsComment?: string;
  
  // Contractor section
  problemAssistanceRequested?: string;
  tier1Date?: Date;
  tier2Date?: Date;
  tier3Date?: Date;
  problemResolved?: boolean;
  contractorComments?: string;
  
  // Additional tracking fields
  formSubmissionType?: string;
  fmrCreatedDate?: Date;
  warrantyStopDate?: Date;
  completedDate?: Date;
  fmrReceivedDateByFailures?: Date;
  trackingNoType?: string;
  trackingNo?: string;
  rmaNoType?: string;
  rmaNo?: string;
  engineerDeployedType?: string;
  engineerName?: string;
  deploymentDate?: Date;
  recordUpdated?: Date;
  recordEnteredOn?: Date;
  recordEnteredBy?: string;
}

export interface CreateFMRRequest {
  title: string;
  description?: string;
  status?: FMRStatus;
  
  // Report section
  controlNumber?: string;
  program?: string;
  unit?: string;
  ommodSn?: string;
  ommodSystemMeterHrs?: string;
  technicianName?: string;
  email?: string;
  commNumber?: string;
  dateReported?: Date;
  failedDate?: Date;
  pointOfFailure?: PointOfFailure;
  failedPartNomenclature?: string;
  failedPartNumber?: string;
  qty?: string;
  partSerialNumber?: string;
  describeFailure?: string;
  troubleShootingPerformed?: string;
  repairTechnician?: string;
  repairStartDate?: Date;
  repairActivityDescription?: string;
  
  // Processing section
  repairAction?: RepairAction;
  repairActionOther?: string;
  
  // Supply Chain section
  signed1149?: Signed1149Status;
  signed1149Date?: Date;
  failedPartReceivedDate?: Date;
  newPartReceivedDate?: Date;
  newPartIssuedDate?: Date;
  newPartSerialNumber?: string;
  supplyComments?: string;
  
  // Procurement section
  poNumber?: string;
  warrantyStartDate?: Date;
  newPartOrderedDate?: Date;
  vendorContactAddress?: string;
  procurementComments?: string;
  
  // Logistics section
  requestDate?: Date;
  requestToVendorDate?: Date;
  rmaReceivedDate?: Date;
  shippedToVendorDate?: Date;
  logisticsComment?: string;
  
  // Contractor section
  problemAssistanceRequested?: string;
  tier1Date?: Date;
  tier2Date?: Date;
  tier3Date?: Date;
  problemResolved?: boolean;
  contractorComments?: string;
  
  // Additional tracking fields
  formSubmissionType?: string;
  fmrCreatedDate?: Date;
  warrantyStopDate?: Date;
  completedDate?: Date;
  fmrReceivedDateByFailures?: Date;
  trackingNoType?: string;
  trackingNo?: string;
  rmaNoType?: string;
  rmaNo?: string;
  engineerDeployedType?: string;
  engineerName?: string;
  deploymentDate?: Date;
  recordEnteredBy?: string;
}

export interface UpdateFMRRequest {
  id: number;
  title?: string;
  description?: string;
  status?: FMRStatus;
  resolutionDate?: Date;
  
  // All the same optional fields as CreateFMRRequest
  controlNumber?: string;
  program?: string;
  unit?: string;
  ommodSn?: string;
  ommodSystemMeterHrs?: string;
  technicianName?: string;
  email?: string;
  commNumber?: string;
  dateReported?: Date;
  failedDate?: Date;
  pointOfFailure?: PointOfFailure;
  failedPartNomenclature?: string;
  failedPartNumber?: string;
  qty?: string;
  partSerialNumber?: string;
  describeFailure?: string;
  troubleShootingPerformed?: string;
  repairTechnician?: string;
  repairStartDate?: Date;
  repairActivityDescription?: string;
  repairAction?: RepairAction;
  repairActionOther?: string;
  signed1149?: Signed1149Status;
  signed1149Date?: Date;
  failedPartReceivedDate?: Date;
  newPartReceivedDate?: Date;
  newPartIssuedDate?: Date;
  newPartSerialNumber?: string;
  supplyComments?: string;
  poNumber?: string;
  warrantyStartDate?: Date;
  newPartOrderedDate?: Date;
  vendorContactAddress?: string;
  procurementComments?: string;
  requestDate?: Date;
  requestToVendorDate?: Date;
  rmaReceivedDate?: Date;
  shippedToVendorDate?: Date;
  logisticsComment?: string;
  problemAssistanceRequested?: string;
  tier1Date?: Date;
  tier2Date?: Date;
  tier3Date?: Date;
  problemResolved?: boolean;
  contractorComments?: string;
  
  // Additional tracking fields
  formSubmissionType?: string;
  fmrCreatedDate?: Date;
  warrantyStopDate?: Date;
  completedDate?: Date;
  fmrReceivedDateByFailures?: Date;
  trackingNoType?: string;
  trackingNo?: string;
  rmaNoType?: string;
  rmaNo?: string;
  engineerDeployedType?: string;
  engineerName?: string;
  deploymentDate?: Date;
  recordEnteredBy?: string;
}

export interface FMRListResponse {
  fmrs: FMRRequest[];
  total: number;
}

export interface FMRFilters {
  status?: FMRStatus;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
  tierLevel?: TierLevel;
}
