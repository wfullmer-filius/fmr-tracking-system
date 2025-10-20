import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ArrowLeft, Save, Send, RotateCcw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import backend from "~backend/client";
import type { CreateFMRRequest, PointOfFailure, RepairAction, Signed1149Status } from "~backend/fmr/types";

const UNITS = [
  "103rd ACS", "109th ACS", "116th ACS", "117th ACS", "123rd ACS", "128th ACS",
  "133rd TS", "134th ACS", "141st ACS", "255th ACS", "606th ACS", "607th ACS",
  "726th ACS", "729th ACS", "DEPOT", "DMOC", "HAFB-SIL"
];

const OMMOD_SNS = Array.from({ length: 18 }, (_, i) => `SN${i + 1}`);

export default function NewFMR() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showResetDialog, setShowResetDialog] = useState(false);
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});

  // Form state
  const [formData, setFormData] = useState<Partial<CreateFMRRequest>>({
    title: "",
    description: "",
    program: "CRC - AN/TYQ-23A - OMMOD",
  });

  const createMutation = useMutation({
    mutationFn: async (data: { formData: CreateFMRRequest; status: "Draft" | "Submitted" }) => {
      return backend.fmr.create({
        ...data.formData,
        status: data.status,
      });
    },
    onSuccess: (_, variables) => {
      toast({
        title: variables.status === "Draft" ? "Draft Saved" : "FMR Submitted",
        description: variables.status === "Draft" 
          ? "Your FMR has been saved as a draft."
          : "Your FMR has been submitted successfully.",
      });
      navigate("/dashboard");
    },
    onError: (error) => {
      console.error("Create FMR error:", error);
      toast({
        title: "Error",
        description: "Failed to save FMR. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateField = (field: keyof CreateFMRRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value === "" ? undefined : value,
    }));
  };

  const updateDateField = (field: keyof CreateFMRRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value ? new Date(value) : undefined,
    }));
  };

  const formatDateForInput = (date?: Date) => {
    if (!date) return "";
    return date.toISOString().split("T")[0];
  };

  const validateRequiredFields = () => {
    const required = [
      "technicianName", "email", "commNumber", "dateReported", "failedDate",
      "pointOfFailure", "failedPartNomenclature", "failedPartNumber", "describeFailure",
      "requestDate", "problemAssistanceRequested"
    ];
    
    for (const field of required) {
      const value = formData[field as keyof CreateFMRRequest];
      if (value === undefined || value === "" || value === null) {
        return field;
      }
    }
    return null;
  };

  const handleSubmit = (status: "Draft" | "Submitted") => {
    if (status === "Submitted") {
      const firstMissingField = validateRequiredFields();
      if (firstMissingField) {
        const fieldElement = fieldRefs.current[firstMissingField];
        if (fieldElement) {
          fieldElement.scrollIntoView({ behavior: "smooth", block: "center" });
          fieldElement.focus();
        }
        toast({
          title: "Required Fields Missing",
          description: "Please fill in all required fields before submitting.",
          variant: "destructive",
        });
        return;
      }
    }

    createMutation.mutate({
      formData: formData as CreateFMRRequest,
      status,
    });
  };

  const handleReset = () => {
    setFormData({
      title: "",
      description: "",
      program: "CRC - AN/TYQ-23A - OMMOD",
    });
    setShowResetDialog(false);
    toast({
      title: "Form Reset",
      description: "The form has been cleared.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">New FMR Request</h1>
        </div>
      </div>

      {/* Report Section */}
      <Card>
        <CardHeader>
          <CardTitle>Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="controlNumber">Control #</Label>
              <Input
                id="controlNumber"
                value={formData.controlNumber || ""}
                onChange={(e) => updateField("controlNumber", e.target.value)}
                placeholder="Enter control number"
              />
            </div>
            <div>
              <Label htmlFor="program">Program</Label>
              <Input
                id="program"
                value={formData.program || ""}
                onChange={(e) => updateField("program", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="unit">UNIT</Label>
              <Select value={formData.unit || ""} onValueChange={(value) => updateField("unit", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map(unit => (
                    <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ommodSn">OMMOD SN#</Label>
              <Select value={formData.ommodSn || ""} onValueChange={(value) => updateField("ommodSn", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select OMMOD SN" />
                </SelectTrigger>
                <SelectContent>
                  {OMMOD_SNS.map(sn => (
                    <SelectItem key={sn} value={sn}>{sn}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="ommodSystemMeterHrs">OMMOD System Meter Hrs</Label>
              <Input
                id="ommodSystemMeterHrs"
                value={formData.ommodSystemMeterHrs || ""}
                onChange={(e) => updateField("ommodSystemMeterHrs", e.target.value)}
                placeholder="Enter system meter hours"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="technicianName" className="font-bold text-red-600">Technician Name *</Label>
              <Input
                id="technicianName"
                ref={(el) => { fieldRefs.current.technicianName = el; }}
                value={formData.technicianName || ""}
                onChange={(e) => updateField("technicianName", e.target.value)}
                placeholder="Enter technician name"
                required
              />
            </div>
            <div>
              <Label htmlFor="email" className="font-bold text-red-600">Email *</Label>
              <Input
                id="email"
                type="email"
                ref={(el) => { fieldRefs.current.email = el; }}
                value={formData.email || ""}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="Enter email address"
                required
              />
            </div>
            <div>
              <Label htmlFor="commNumber" className="font-bold text-red-600">Comm # *</Label>
              <Input
                id="commNumber"
                ref={(el) => { fieldRefs.current.commNumber = el; }}
                value={formData.commNumber || ""}
                onChange={(e) => updateField("commNumber", e.target.value)}
                placeholder="Enter communication number"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dateReported" className="font-bold text-red-600">Date Reported *</Label>
              <Input
                id="dateReported"
                type="date"
                ref={(el) => { fieldRefs.current.dateReported = el; }}
                value={formatDateForInput(formData.dateReported)}
                onChange={(e) => updateDateField("dateReported", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="failedDate" className="font-bold text-red-600">Failed Date *</Label>
              <Input
                id="failedDate"
                type="date"
                ref={(el) => { fieldRefs.current.failedDate = el; }}
                value={formatDateForInput(formData.failedDate)}
                onChange={(e) => updateDateField("failedDate", e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="pointOfFailure" className="font-bold text-red-600">Point of Failure *</Label>
            <Select value={formData.pointOfFailure || ""} onValueChange={(value) => updateField("pointOfFailure", value as PointOfFailure)}>
              <SelectTrigger ref={(el) => { fieldRefs.current.pointOfFailure = el; }}>
                <SelectValue placeholder="Select point of failure" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Receipt">Receipt</SelectItem>
                <SelectItem value="Testing">Testing</SelectItem>
                <SelectItem value="Mission">Mission</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="failedPartNomenclature" className="font-bold text-red-600">Failed Part Nomenclature *</Label>
              <Input
                id="failedPartNomenclature"
                ref={(el) => { fieldRefs.current.failedPartNomenclature = el; }}
                value={formData.failedPartNomenclature || ""}
                onChange={(e) => updateField("failedPartNomenclature", e.target.value)}
                placeholder="Enter part nomenclature"
                required
              />
            </div>
            <div>
              <Label htmlFor="failedPartNumber" className="font-bold text-red-600">Failed Part Number *</Label>
              <Input
                id="failedPartNumber"
                ref={(el) => { fieldRefs.current.failedPartNumber = el; }}
                value={formData.failedPartNumber || ""}
                onChange={(e) => updateField("failedPartNumber", e.target.value)}
                placeholder="Enter part number"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="qty">Qty</Label>
              <Input
                id="qty"
                value={formData.qty || ""}
                onChange={(e) => updateField("qty", e.target.value)}
                placeholder="Enter quantity"
              />
            </div>
            <div>
              <Label htmlFor="partSerialNumber">Part Serial #</Label>
              <Input
                id="partSerialNumber"
                value={formData.partSerialNumber || ""}
                onChange={(e) => updateField("partSerialNumber", e.target.value)}
                placeholder="Enter part serial number"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="describeFailure" className="font-bold text-red-600">Describe Failure *</Label>
            <Textarea
              id="describeFailure"
              ref={(el) => { fieldRefs.current.describeFailure = el; }}
              value={formData.describeFailure || ""}
              onChange={(e) => updateField("describeFailure", e.target.value)}
              placeholder="Describe the failure in detail"
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="troubleShootingPerformed">Trouble Shooting Performed</Label>
            <Textarea
              id="troubleShootingPerformed"
              value={formData.troubleShootingPerformed || ""}
              onChange={(e) => updateField("troubleShootingPerformed", e.target.value)}
              placeholder="Describe troubleshooting steps performed"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="repairTechnician">Repair Technician</Label>
              <Input
                id="repairTechnician"
                value={formData.repairTechnician || ""}
                onChange={(e) => updateField("repairTechnician", e.target.value)}
                placeholder="Enter repair technician name"
              />
            </div>
            <div>
              <Label htmlFor="repairStartDate">Repair Start Date</Label>
              <Input
                id="repairStartDate"
                type="date"
                value={formatDateForInput(formData.repairStartDate)}
                onChange={(e) => updateDateField("repairStartDate", e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="repairActivityDescription">Repair Activity Description</Label>
            <Textarea
              id="repairActivityDescription"
              value={formData.repairActivityDescription || ""}
              onChange={(e) => updateField("repairActivityDescription", e.target.value)}
              placeholder="Describe repair activities"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Processing Section */}
      <Card>
        <CardHeader>
          <CardTitle>Processing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="repairAction">Repair Action</Label>
            <Select value={formData.repairAction || ""} onValueChange={(value) => updateField("repairAction", value as RepairAction)}>
              <SelectTrigger>
                <SelectValue placeholder="Select repair action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RMA">RMA</SelectItem>
                <SelectItem value="Rework">Rework</SelectItem>
                <SelectItem value="Scrap/New Part">Scrap/New Part</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.repairAction === "Other" && (
            <div>
              <Label htmlFor="repairActionOther">Other Repair Action</Label>
              <Input
                id="repairActionOther"
                value={formData.repairActionOther || ""}
                onChange={(e) => updateField("repairActionOther", e.target.value)}
                placeholder="Specify other repair action"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Supply Chain Section */}
      <Card>
        <CardHeader>
          <CardTitle>Supply Chain</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="signed1149">Signed 1149</Label>
            <Select value={formData.signed1149 || ""} onValueChange={(value) => updateField("signed1149", value as Signed1149Status)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="N/A">N/A</SelectItem>
                <SelectItem value="Waiting for Signature">Waiting for Signature</SelectItem>
                <SelectItem value="Sign Date">Sign Date</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.signed1149 === "Sign Date" && (
            <div>
              <Label htmlFor="signed1149Date">Sign Date *</Label>
              <Input
                id="signed1149Date"
                type="date"
                value={formatDateForInput(formData.signed1149Date)}
                onChange={(e) => updateDateField("signed1149Date", e.target.value)}
                required
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="failedPartReceivedDate">Failed Part Received Date</Label>
              <Input
                id="failedPartReceivedDate"
                type="date"
                value={formatDateForInput(formData.failedPartReceivedDate)}
                onChange={(e) => updateDateField("failedPartReceivedDate", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="newPartReceivedDate">New Part Received Date</Label>
              <Input
                id="newPartReceivedDate"
                type="date"
                value={formatDateForInput(formData.newPartReceivedDate)}
                onChange={(e) => updateDateField("newPartReceivedDate", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="newPartIssuedDate">New Part Issued Date</Label>
              <Input
                id="newPartIssuedDate"
                type="date"
                value={formatDateForInput(formData.newPartIssuedDate)}
                onChange={(e) => updateDateField("newPartIssuedDate", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="newPartSerialNumber">New Part Serial #</Label>
              <Input
                id="newPartSerialNumber"
                value={formData.newPartSerialNumber || ""}
                onChange={(e) => updateField("newPartSerialNumber", e.target.value)}
                placeholder="Enter new part serial number"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="supplyComments">Supply Comments</Label>
            <Textarea
              id="supplyComments"
              value={formData.supplyComments || ""}
              onChange={(e) => updateField("supplyComments", e.target.value)}
              placeholder="Enter supply chain comments"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Procurement Section */}
      <Card>
        <CardHeader>
          <CardTitle>Procurement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="poNumber">PO#</Label>
              <Input
                id="poNumber"
                value={formData.poNumber || ""}
                onChange={(e) => updateField("poNumber", e.target.value)}
                placeholder="Enter purchase order number"
              />
            </div>
            <div>
              <Label htmlFor="warrantyStartDate">Warranty Start Date</Label>
              <Input
                id="warrantyStartDate"
                type="date"
                value={formatDateForInput(formData.warrantyStartDate)}
                onChange={(e) => updateDateField("warrantyStartDate", e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="newPartOrderedDate">New Part Ordered Date</Label>
            <Input
              id="newPartOrderedDate"
              type="date"
              value={formatDateForInput(formData.newPartOrderedDate)}
              onChange={(e) => updateDateField("newPartOrderedDate", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="vendorContactAddress">Vendor Contact Address</Label>
            <Textarea
              id="vendorContactAddress"
              value={formData.vendorContactAddress || ""}
              onChange={(e) => updateField("vendorContactAddress", e.target.value)}
              placeholder="Enter vendor contact address"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="procurementComments">Procurement Comments</Label>
            <Textarea
              id="procurementComments"
              value={formData.procurementComments || ""}
              onChange={(e) => updateField("procurementComments", e.target.value)}
              placeholder="Enter procurement comments"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Logistics Section */}
      <Card>
        <CardHeader>
          <CardTitle>Logistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="requestDate" className="font-bold text-red-600">Request Date *</Label>
            <Input
              id="requestDate"
              type="date"
              ref={(el) => { fieldRefs.current.requestDate = el; }}
              value={formatDateForInput(formData.requestDate)}
              onChange={(e) => updateDateField("requestDate", e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="requestToVendorDate">Request To Vendor Date</Label>
              <Input
                id="requestToVendorDate"
                type="date"
                value={formatDateForInput(formData.requestToVendorDate)}
                onChange={(e) => updateDateField("requestToVendorDate", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="rmaReceivedDate">RMA Received Date</Label>
              <Input
                id="rmaReceivedDate"
                type="date"
                value={formatDateForInput(formData.rmaReceivedDate)}
                onChange={(e) => updateDateField("rmaReceivedDate", e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="shippedToVendorDate">Shipped To Vendor Date</Label>
            <Input
              id="shippedToVendorDate"
              type="date"
              value={formatDateForInput(formData.shippedToVendorDate)}
              onChange={(e) => updateDateField("shippedToVendorDate", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="logisticsComment">Logistics Comment</Label>
            <Textarea
              id="logisticsComment"
              value={formData.logisticsComment || ""}
              onChange={(e) => updateField("logisticsComment", e.target.value)}
              placeholder="Enter logistics comments"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contractor Section */}
      <Card>
        <CardHeader>
          <CardTitle>Contractor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="problemAssistanceRequested" className="font-bold text-red-600">Problem/Assistance Requested *</Label>
            <Input
              id="problemAssistanceRequested"
              ref={(el) => { fieldRefs.current.problemAssistanceRequested = el; }}
              value={formData.problemAssistanceRequested || ""}
              onChange={(e) => updateField("problemAssistanceRequested", e.target.value)}
              placeholder="Describe problem or assistance requested"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="tier1Date">Tier 1</Label>
              <Input
                id="tier1Date"
                type="date"
                value={formatDateForInput(formData.tier1Date)}
                onChange={(e) => updateDateField("tier1Date", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="tier2Date">Tier 2</Label>
              <Input
                id="tier2Date"
                type="date"
                value={formatDateForInput(formData.tier2Date)}
                onChange={(e) => updateDateField("tier2Date", e.target.value)}
                disabled={!formData.tier1Date}
              />
            </div>
            <div>
              <Label htmlFor="tier3Date">Tier 3</Label>
              <Input
                id="tier3Date"
                type="date"
                value={formatDateForInput(formData.tier3Date)}
                onChange={(e) => updateDateField("tier3Date", e.target.value)}
                disabled={!formData.tier2Date}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="problemResolved">Problem Resolved</Label>
            <Select 
              value={formData.problemResolved === undefined ? "" : formData.problemResolved ? "yes" : "no"} 
              onValueChange={(value) => updateField("problemResolved", value === "yes")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select resolution status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="contractorComments">Contractor Comments</Label>
            <Textarea
              id="contractorComments"
              value={formData.contractorComments || ""}
              onChange={(e) => updateField("contractorComments", e.target.value)}
              placeholder="Enter contractor comments"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => setShowResetDialog(true)}
              disabled={createMutation.isPending}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSubmit("Draft")}
              disabled={createMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              Save as Draft
            </Button>
            <Button
              onClick={() => handleSubmit("Submitted")}
              disabled={createMutation.isPending}
            >
              <Send className="w-4 h-4 mr-2" />
              Submit FMR
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to clear this form?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All entered data will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset}>
              Yes, clear form
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}