import { api } from "encore.dev/api";
import db from "../db";
import { CreateFMRRequest, FMRRequest } from "./types";

// Creates a new FMR request
export const create = api<CreateFMRRequest, FMRRequest>(
  { expose: true, method: "POST", path: "/fmr" },
  async (req) => {
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
      record_entered_by: string | null;
    }>`
      INSERT INTO fmr_requests (
        title, description, status, control_number, program, unit, ommod_sn, ommod_system_meter_hrs,
        technician_name, email, comm_number, date_reported, failed_date, point_of_failure,
        failed_part_nomenclature, failed_part_number, qty, part_serial_number, describe_failure,
        trouble_shooting_performed, repair_technician, repair_start_date, repair_activity_description,
        repair_action, repair_action_other, signed_1149, signed_1149_date, failed_part_received_date,
        new_part_received_date, new_part_issued_date, new_part_serial_number, supply_comments,
        po_number, warranty_start_date, new_part_ordered_date, vendor_contact_address, procurement_comments,
        request_date, request_to_vendor_date, rma_received_date, shipped_to_vendor_date, logistics_comment,
        problem_assistance_requested, tier_1_date, tier_2_date, tier_3_date, problem_resolved, contractor_comments,
        form_submission_type, fmr_created_date, warranty_stop_date, completed_date, fmr_received_date_by_failures,
        tracking_no_type, tracking_no, rma_no_type, rma_no, engineer_deployed_type, engineer_name, deployment_date,
        record_entered_by
      ) VALUES (
        ${req.title}, ${req.description || null}, ${req.status || 'Draft'}, ${req.controlNumber || null},
        ${req.program || 'CRC - AN/TYQ-23A - OMMOD'}, ${req.unit || null}, ${req.ommodSn || null},
        ${req.ommodSystemMeterHrs || null}, ${req.technicianName || null}, ${req.email || null},
        ${req.commNumber || null}, ${req.dateReported || null}, ${req.failedDate || null},
        ${req.pointOfFailure || null}, ${req.failedPartNomenclature || null}, ${req.failedPartNumber || null},
        ${req.qty || null}, ${req.partSerialNumber || null}, ${req.describeFailure || null},
        ${req.troubleShootingPerformed || null}, ${req.repairTechnician || null}, ${req.repairStartDate || null},
        ${req.repairActivityDescription || null}, ${req.repairAction || null}, ${req.repairActionOther || null},
        ${req.signed1149 || null}, ${req.signed1149Date || null}, ${req.failedPartReceivedDate || null},
        ${req.newPartReceivedDate || null}, ${req.newPartIssuedDate || null}, ${req.newPartSerialNumber || null},
        ${req.supplyComments || null}, ${req.poNumber || null}, ${req.warrantyStartDate || null},
        ${req.newPartOrderedDate || null}, ${req.vendorContactAddress || null}, ${req.procurementComments || null},
        ${req.requestDate || null}, ${req.requestToVendorDate || null}, ${req.rmaReceivedDate || null},
        ${req.shippedToVendorDate || null}, ${req.logisticsComment || null}, ${req.problemAssistanceRequested || null},
        ${req.tier1Date || null}, ${req.tier2Date || null}, ${req.tier3Date || null},
        ${req.problemResolved || null}, ${req.contractorComments || null},
        ${req.formSubmissionType || null}, ${req.fmrCreatedDate || null}, ${req.warrantyStopDate || null},
        ${req.completedDate || null}, ${req.fmrReceivedDateByFailures || null}, ${req.trackingNoType || null},
        ${req.trackingNo || null}, ${req.rmaNoType || null}, ${req.rmaNo || null}, ${req.engineerDeployedType || null},
        ${req.engineerName || null}, ${req.deploymentDate || null}, ${req.recordEnteredBy || null}
      )
      RETURNING *
    `;

    if (!row) {
      throw new Error("Failed to create FMR request");
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
      
      // Report section
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
      
      // Processing section
      repairAction: row.repair_action as any || undefined,
      repairActionOther: row.repair_action_other || undefined,
      
      // Supply Chain section
      signed1149: row.signed_1149 as any || undefined,
      signed1149Date: row.signed_1149_date || undefined,
      failedPartReceivedDate: row.failed_part_received_date || undefined,
      newPartReceivedDate: row.new_part_received_date || undefined,
      newPartIssuedDate: row.new_part_issued_date || undefined,
      newPartSerialNumber: row.new_part_serial_number || undefined,
      supplyComments: row.supply_comments || undefined,
      
      // Procurement section
      poNumber: row.po_number || undefined,
      warrantyStartDate: row.warranty_start_date || undefined,
      newPartOrderedDate: row.new_part_ordered_date || undefined,
      vendorContactAddress: row.vendor_contact_address || undefined,
      procurementComments: row.procurement_comments || undefined,
      
      // Logistics section
      requestDate: row.request_date || undefined,
      requestToVendorDate: row.request_to_vendor_date || undefined,
      rmaReceivedDate: row.rma_received_date || undefined,
      shippedToVendorDate: row.shipped_to_vendor_date || undefined,
      logisticsComment: row.logistics_comment || undefined,
      
      // Contractor section
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
      recordEnteredBy: row.record_entered_by || undefined,
    };
  }
);
