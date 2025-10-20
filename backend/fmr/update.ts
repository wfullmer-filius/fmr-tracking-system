import { api, APIError } from "encore.dev/api";
import db from "../db";
import { UpdateFMRRequest, FMRRequest } from "./types";

const fieldMapping: Record<string, string> = {
  title: "title",
  description: "description",
  status: "status",
  resolutionDate: "resolution_date",
  controlNumber: "control_number",
  program: "program",
  unit: "unit",
  ommodSn: "ommod_sn",
  ommodSystemMeterHrs: "ommod_system_meter_hrs",
  technicianName: "technician_name",
  email: "email",
  commNumber: "comm_number",
  dateReported: "date_reported",
  failedDate: "failed_date",
  pointOfFailure: "point_of_failure",
  failedPartNomenclature: "failed_part_nomenclature",
  failedPartNumber: "failed_part_number",
  qty: "qty",
  partSerialNumber: "part_serial_number",
  describeFailure: "describe_failure",
  troubleShootingPerformed: "trouble_shooting_performed",
  repairTechnician: "repair_technician",
  repairStartDate: "repair_start_date",
  repairActivityDescription: "repair_activity_description",
  repairAction: "repair_action",
  repairActionOther: "repair_action_other",
  signed1149: "signed_1149",
  signed1149Date: "signed_1149_date",
  failedPartReceivedDate: "failed_part_received_date",
  newPartReceivedDate: "new_part_received_date",
  newPartIssuedDate: "new_part_issued_date",
  newPartSerialNumber: "new_part_serial_number",
  supplyComments: "supply_comments",
  poNumber: "po_number",
  warrantyStartDate: "warranty_start_date",
  newPartOrderedDate: "new_part_ordered_date",
  vendorContactAddress: "vendor_contact_address",
  procurementComments: "procurement_comments",
  requestDate: "request_date",
  requestToVendorDate: "request_to_vendor_date",
  rmaReceivedDate: "rma_received_date",
  shippedToVendorDate: "shipped_to_vendor_date",
  logisticsComment: "logistics_comment",
  problemAssistanceRequested: "problem_assistance_requested",
  tier1Date: "tier_1_date",
  tier2Date: "tier_2_date",
  tier3Date: "tier_3_date",
  problemResolved: "problem_resolved",
  contractorComments: "contractor_comments",
  formSubmissionType: "form_submission_type",
  fmrCreatedDate: "fmr_created_date",
  warrantyStopDate: "warranty_stop_date",
  completedDate: "completed_date",
  fmrReceivedDateByFailures: "fmr_received_date_by_failures",
  trackingNoType: "tracking_no_type",
  trackingNo: "tracking_no",
  rmaNoType: "rma_no_type",
  rmaNo: "rma_no",
  engineerDeployedType: "engineer_deployed_type",
  engineerName: "engineer_name",
  deploymentDate: "deployment_date",
  recordEnteredBy: "record_entered_by",
};

export const update = api<UpdateFMRRequest, FMRRequest>(
  { expose: true, method: "PUT", path: "/fmr/:id" },
  async (req) => {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(req)) {
      if (key === "id") continue;
      
      const dbField = fieldMapping[key];
      if (dbField && value !== undefined) {
        updates.push(`${dbField} = $${paramIndex++}`);
        params.push(value);
      }
    }

    if (req.status === "Resolved" && !req.resolutionDate) {
      updates.push(`resolution_date = $${paramIndex++}`);
      params.push(new Date());
    }

    if (updates.length === 0) {
      throw APIError.invalidArgument("No fields to update");
    }

    updates.push(`updated_at = NOW()`);
    updates.push(`record_updated = NOW()`);
    params.push(req.id);

    const query = `
      UPDATE fmr_requests 
      SET ${updates.join(", ")} 
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const row = await db.rawQueryRow<{
      id: number;
      title: string;
      description: string | null;
      status: string;
      creation_date: Date;
      resolution_date: Date | null;
      created_at: Date;
      updated_at: Date;
      control_number: string | null;
      program: string | null;
      unit: string | null;
      ommod_sn: string | null;
      ommod_system_meter_hrs: string | null;
      technician_name: string | null;
      email: string | null;
      comm_number: string | null;
      date_reported: Date | null;
      failed_date: Date | null;
      point_of_failure: string | null;
      failed_part_nomenclature: string | null;
      failed_part_number: string | null;
      qty: string | null;
      part_serial_number: string | null;
      describe_failure: string | null;
      trouble_shooting_performed: string | null;
      repair_technician: string | null;
      repair_start_date: Date | null;
      repair_activity_description: string | null;
      repair_action: string | null;
      repair_action_other: string | null;
      signed_1149: string | null;
      signed_1149_date: Date | null;
      failed_part_received_date: Date | null;
      new_part_received_date: Date | null;
      new_part_issued_date: Date | null;
      new_part_serial_number: string | null;
      supply_comments: string | null;
      po_number: string | null;
      warranty_start_date: Date | null;
      new_part_ordered_date: Date | null;
      vendor_contact_address: string | null;
      procurement_comments: string | null;
      request_date: Date | null;
      request_to_vendor_date: Date | null;
      rma_received_date: Date | null;
      shipped_to_vendor_date: Date | null;
      logistics_comment: string | null;
      problem_assistance_requested: string | null;
      tier_1_date: Date | null;
      tier_2_date: Date | null;
      tier_3_date: Date | null;
      problem_resolved: boolean | null;
      contractor_comments: string | null;
      form_submission_type: string | null;
      fmr_created_date: Date | null;
      warranty_stop_date: Date | null;
      completed_date: Date | null;
      fmr_received_date_by_failures: Date | null;
      tracking_no_type: string | null;
      tracking_no: string | null;
      rma_no_type: string | null;
      rma_no: string | null;
      engineer_deployed_type: string | null;
      engineer_name: string | null;
      deployment_date: Date | null;
      record_updated: Date | null;
      record_entered_on: Date | null;
      record_entered_by: string | null;
    }>(query, ...params);

    if (!row) {
      throw APIError.notFound("FMR request not found");
    }

    return {
      id: row.id,
      title: row.title,
      description: row.description || undefined,
      status: row.status as any,
      creationDate: row.creation_date,
      resolutionDate: row.resolution_date || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      
      controlNumber: row.control_number || undefined,
      program: row.program || undefined,
      unit: row.unit || undefined,
      ommodSn: row.ommod_sn || undefined,
      ommodSystemMeterHrs: row.ommod_system_meter_hrs || undefined,
      technicianName: row.technician_name || undefined,
      email: row.email || undefined,
      commNumber: row.comm_number || undefined,
      dateReported: row.date_reported || undefined,
      failedDate: row.failed_date || undefined,
      pointOfFailure: row.point_of_failure as any || undefined,
      failedPartNomenclature: row.failed_part_nomenclature || undefined,
      failedPartNumber: row.failed_part_number || undefined,
      qty: row.qty || undefined,
      partSerialNumber: row.part_serial_number || undefined,
      describeFailure: row.describe_failure || undefined,
      troubleShootingPerformed: row.trouble_shooting_performed || undefined,
      repairTechnician: row.repair_technician || undefined,
      repairStartDate: row.repair_start_date || undefined,
      repairActivityDescription: row.repair_activity_description || undefined,
      
      repairAction: row.repair_action as any || undefined,
      repairActionOther: row.repair_action_other || undefined,
      
      signed1149: row.signed_1149 as any || undefined,
      signed1149Date: row.signed_1149_date || undefined,
      failedPartReceivedDate: row.failed_part_received_date || undefined,
      newPartReceivedDate: row.new_part_received_date || undefined,
      newPartIssuedDate: row.new_part_issued_date || undefined,
      newPartSerialNumber: row.new_part_serial_number || undefined,
      supplyComments: row.supply_comments || undefined,
      
      poNumber: row.po_number || undefined,
      warrantyStartDate: row.warranty_start_date || undefined,
      newPartOrderedDate: row.new_part_ordered_date || undefined,
      vendorContactAddress: row.vendor_contact_address || undefined,
      procurementComments: row.procurement_comments || undefined,
      
      requestDate: row.request_date || undefined,
      requestToVendorDate: row.request_to_vendor_date || undefined,
      rmaReceivedDate: row.rma_received_date || undefined,
      shippedToVendorDate: row.shipped_to_vendor_date || undefined,
      logisticsComment: row.logistics_comment || undefined,
      
      problemAssistanceRequested: row.problem_assistance_requested || undefined,
      tier1Date: row.tier_1_date || undefined,
      tier2Date: row.tier_2_date || undefined,
      tier3Date: row.tier_3_date || undefined,
      problemResolved: row.problem_resolved || undefined,
      contractorComments: row.contractor_comments || undefined,
      
      formSubmissionType: row.form_submission_type || undefined,
      fmrCreatedDate: row.fmr_created_date || undefined,
      warrantyStopDate: row.warranty_stop_date || undefined,
      completedDate: row.completed_date || undefined,
      fmrReceivedDateByFailures: row.fmr_received_date_by_failures || undefined,
      trackingNoType: row.tracking_no_type || undefined,
      trackingNo: row.tracking_no || undefined,
      rmaNoType: row.rma_no_type || undefined,
      rmaNo: row.rma_no || undefined,
      engineerDeployedType: row.engineer_deployed_type || undefined,
      engineerName: row.engineer_name || undefined,
      deploymentDate: row.deployment_date || undefined,
      recordUpdated: row.record_updated || undefined,
      recordEnteredOn: row.record_entered_on || undefined,
      recordEnteredBy: row.record_entered_by || undefined,
    };
  }
);