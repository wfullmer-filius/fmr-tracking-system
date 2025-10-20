import { api, APIError } from "encore.dev/api";
import db from "../db";
import { FMRRequest } from "./types";

interface GetFMRParams {
  id: number;
}

export const get = api<GetFMRParams, FMRRequest>(
  { expose: true, method: "GET", path: "/fmr/:id" },
  async (params) => {
    const row = await db.queryRow<{
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
    }>`
      SELECT * FROM fmr_requests WHERE id = ${params.id}
    `;

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