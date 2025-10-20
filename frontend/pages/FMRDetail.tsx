import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, Edit, Save, X, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import backend from "~backend/client";
import type { FMRStatus, FMRRequest, PointOfFailure, RepairAction, Signed1149Status } from "~backend/fmr/types";
import { usePolling } from "../hooks/usePolling";

const UNITS = [
  "103rd ACS", "109th ACS", "116th ACS", "117th ACS", "123rd ACS", "128th ACS",
  "133rd TS", "134th ACS", "141st ACS", "255th ACS", "606th ACS", "607th ACS",
  "726th ACS", "729th ACS", "DEPOT", "DMOC", "HAFB-SIL"
];

const OMMOD_SNS = Array.from({ length: 18 }, (_, i) => `SN${i + 1}`);

export default function FMRDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [newNote, setNewNote] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<FMRRequest>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: fmr, isLoading, refetch: refetchFmr, isFetching: isFetchingFmr } = useQuery({
    queryKey: ["fmr", id],
    queryFn: async () => {
      return backend.fmr.get({ id: parseInt(id!) });
    },
    enabled: !!id,
  });

  const { data: notes, refetch: refetchNotes, isFetching: isFetchingNotes } = useQuery({
    queryKey: ["notes", id],
    queryFn: async () => {
      return backend.notes.list({ fmrId: parseInt(id!) });
    },
    enabled: !!id,
  });

  usePolling({
    enabled: !isEditing && !!id,
    interval: 30000,
    onPoll: () => {
      refetchFmr();
      refetchNotes();
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: async (content: string) => {
      return backend.notes.create({
        fmrId: parseInt(id!),
        content,
        noteType: "general",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", id] });
      setNewNote("");
      toast({
        title: "Note Added",
        description: "Note has been added successfully.",
      });
    },
    onError: (error) => {
      console.error("Add note error:", error);
      toast({
        title: "Error",
        description: "Failed to add note. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return backend.fmr.update(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fmr", id] });
      queryClient.invalidateQueries({ queryKey: ["fmrs"] });
      toast({
        title: "FMR Updated",
        description: "FMR has been updated successfully.",
      });
      setIsEditing(false);
    },
    onError: (error: any) => {
      console.error("Update FMR error:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to update FMR. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: FMRStatus) => {
    switch (status) {
      case "Draft":
        return "secondary";
      case "Submitted":
        return "default";
      case "Unresolved":
        return "destructive";
      case "In-Progress":
        return "default";
      case "Resolved":
        return "secondary";
      case "Archived":
        return "outline";
      default:
        return "default";
    }
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "-";
    return new Date(date).toLocaleString();
  };

  const formatShortDate = (date: Date | string | undefined) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  const formatDateForInput = (date?: Date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };

  const updateField = useCallback((field: keyof FMRRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value === "" ? undefined : value,
    }));
  }, []);

  const updateDateField = useCallback((field: keyof FMRRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value ? new Date(value) : undefined,
    }));
  }, []);

  const handleEdit = () => {
    if (fmr) {
      const formattedData = { ...fmr };
      setFormData(formattedData);
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({});
  };

  const handleSave = () => {
    const { createdAt, updatedAt, creationDate, recordUpdated, recordEnteredOn, id: _, ...updateData } = formData;
    console.log("Saving FMR with data:", { id: parseInt(id!), ...updateData });
    updateMutation.mutate({ id: parseInt(id!), ...updateData });
  };

  const DetailField = ({ label, value }: { label: string; value: any }) => (
    <div className="py-2">
      <span className="text-sm font-medium text-muted-foreground">{label}:</span>
      <p className="text-sm mt-1">{value || "-"}</p>
    </div>
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!fmr) {
    return <div>FMR not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">FMR #{fmr.id}</h1>
          <Badge variant={getStatusColor(fmr.status)}>
            {fmr.status.replace("-", " ")}
          </Badge>
          {(isFetchingFmr || isFetchingNotes) && (
            <RefreshCw className="w-4 h-4 text-muted-foreground animate-spin" />
          )}
        </div>
        {!isEditing ? (
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Edit FMR
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              <Save className="w-4 h-4 mr-2" />
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {isEditing ? (
                <>
                  <div>
                    <Label htmlFor="controlNumber">Control #</Label>
                    <Input
                      id="controlNumber"
                      value={(formData.controlNumber as string) || ""}
                      onChange={(e) => updateField("controlNumber", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="program">Program</Label>
                    <Input
                      id="program"
                      value={(formData.program as string) || ""}
                      onChange={(e) => updateField("program", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit">Unit</Label>
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
                      value={(formData.ommodSystemMeterHrs as string) || ""}
                      onChange={(e) => updateField("ommodSystemMeterHrs", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status || ""} onValueChange={(value) => updateField("status", value as FMRStatus)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Submitted">Submitted</SelectItem>
                        <SelectItem value="Unresolved">Unresolved</SelectItem>
                        <SelectItem value="In-Progress">In Progress</SelectItem>
                        <SelectItem value="Resolved">Resolved</SelectItem>
                        <SelectItem value="Archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <>
                  <DetailField label="Control #" value={fmr.controlNumber} />
                  <DetailField label="Program" value={fmr.program} />
                  <DetailField label="Unit" value={fmr.unit} />
                  <DetailField label="OMMOD SN#" value={fmr.ommodSn} />
                  <DetailField label="OMMOD System Meter Hrs" value={fmr.ommodSystemMeterHrs} />
                  <DetailField label="Created" value={formatDate(fmr.creationDate)} />
                  {fmr.resolutionDate && (
                    <DetailField label="Resolved" value={formatDate(fmr.resolutionDate)} />
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Report Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {isEditing ? (
                <>
                  <div>
                    <Label htmlFor="technicianName">Technician Name</Label>
                    <Input
                      id="technicianName"
                      value={(formData.technicianName as string) || ""}
                      onChange={(e) => updateField("technicianName", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={(formData.email as string) || ""}
                      onChange={(e) => updateField("email", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="commNumber">Comm #</Label>
                    <Input
                      id="commNumber"
                      value={(formData.commNumber as string) || ""}
                      onChange={(e) => updateField("commNumber", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateReported">Date Reported</Label>
                    <Input
                      id="dateReported"
                      type="date"
                      value={formatDateForInput(formData.dateReported as Date | undefined)}
                      onChange={(e) => updateDateField("dateReported", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="failedDate">Failed Date</Label>
                    <Input
                      id="failedDate"
                      type="date"
                      value={formatDateForInput(formData.failedDate as Date | undefined)}
                      onChange={(e) => updateDateField("failedDate", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pointOfFailure">Point of Failure</Label>
                    <Select value={formData.pointOfFailure || ""} onValueChange={(value) => updateField("pointOfFailure", value as PointOfFailure)}>
                      <SelectTrigger>
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
                  <div>
                    <Label htmlFor="failedPartNomenclature">Failed Part Nomenclature</Label>
                    <Input
                      id="failedPartNomenclature"
                      value={(formData.failedPartNomenclature as string) || ""}
                      onChange={(e) => updateField("failedPartNomenclature", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="failedPartNumber">Failed Part Number</Label>
                    <Input
                      id="failedPartNumber"
                      value={(formData.failedPartNumber as string) || ""}
                      onChange={(e) => updateField("failedPartNumber", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="qty">Qty</Label>
                    <Input
                      id="qty"
                      value={(formData.qty as string) || ""}
                      onChange={(e) => updateField("qty", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="partSerialNumber">Part Serial #</Label>
                    <Input
                      id="partSerialNumber"
                      value={(formData.partSerialNumber as string) || ""}
                      onChange={(e) => updateField("partSerialNumber", e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="describeFailure">Describe Failure</Label>
                    <Textarea
                      id="describeFailure"
                      value={(formData.describeFailure as string) || ""}
                      onChange={(e) => updateField("describeFailure", e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="troubleShootingPerformed">Troubleshooting Performed</Label>
                    <Textarea
                      id="troubleShootingPerformed"
                      value={(formData.troubleShootingPerformed as string) || ""}
                      onChange={(e) => updateField("troubleShootingPerformed", e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="repairTechnician">Repair Technician</Label>
                    <Input
                      id="repairTechnician"
                      value={(formData.repairTechnician as string) || ""}
                      onChange={(e) => updateField("repairTechnician", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="repairStartDate">Repair Start Date</Label>
                    <Input
                      id="repairStartDate"
                      type="date"
                      value={formatDateForInput(formData.repairStartDate as Date | undefined)}
                      onChange={(e) => updateDateField("repairStartDate", e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="repairActivityDescription">Repair Activity Description</Label>
                    <Textarea
                      id="repairActivityDescription"
                      value={(formData.repairActivityDescription as string) || ""}
                      onChange={(e) => updateField("repairActivityDescription", e.target.value)}
                      rows={3}
                    />
                  </div>
                </>
              ) : (
                <>
                  <DetailField label="Technician Name" value={fmr.technicianName} />
                  <DetailField label="Email" value={fmr.email} />
                  <DetailField label="Comm #" value={fmr.commNumber} />
                  <DetailField label="Date Reported" value={formatShortDate(fmr.dateReported)} />
                  <DetailField label="Failed Date" value={formatShortDate(fmr.failedDate)} />
                  <DetailField label="Point of Failure" value={fmr.pointOfFailure} />
                  <DetailField label="Failed Part Nomenclature" value={fmr.failedPartNomenclature} />
                  <DetailField label="Failed Part Number" value={fmr.failedPartNumber} />
                  <DetailField label="Qty" value={fmr.qty} />
                  <DetailField label="Part Serial #" value={fmr.partSerialNumber} />
                  <div className="col-span-2">
                    <DetailField label="Describe Failure" value={fmr.describeFailure} />
                  </div>
                  <div className="col-span-2">
                    <DetailField label="Troubleshooting Performed" value={fmr.troubleShootingPerformed} />
                  </div>
                  <DetailField label="Repair Technician" value={fmr.repairTechnician} />
                  <DetailField label="Repair Start Date" value={formatShortDate(fmr.repairStartDate)} />
                  <div className="col-span-2">
                    <DetailField label="Repair Activity Description" value={fmr.repairActivityDescription} />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Processing</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {isEditing ? (
                <>
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
                        value={(formData.repairActionOther as string) || ""}
                        onChange={(e) => updateField("repairActionOther", e.target.value)}
                      />
                    </div>
                  )}
                </>
              ) : (
                <>
                  <DetailField label="Repair Action" value={fmr.repairAction} />
                  {fmr.repairAction === "Other" && (
                    <DetailField label="Other Repair Action" value={fmr.repairActionOther} />
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Supply Chain</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {isEditing ? (
                <>
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
                      <Label htmlFor="signed1149Date">Sign Date</Label>
                      <Input
                        id="signed1149Date"
                        type="date"
                        value={formatDateForInput(formData.signed1149Date as Date | undefined)}
                        onChange={(e) => updateDateField("signed1149Date", e.target.value)}
                      />
                    </div>
                  )}
                  <div>
                    <Label htmlFor="failedPartReceivedDate">Failed Part Received Date</Label>
                    <Input
                      id="failedPartReceivedDate"
                      type="date"
                      value={formatDateForInput(formData.failedPartReceivedDate as Date | undefined)}
                      onChange={(e) => updateDateField("failedPartReceivedDate", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPartReceivedDate">New Part Received Date</Label>
                    <Input
                      id="newPartReceivedDate"
                      type="date"
                      value={formatDateForInput(formData.newPartReceivedDate as Date | undefined)}
                      onChange={(e) => updateDateField("newPartReceivedDate", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPartIssuedDate">New Part Issued Date</Label>
                    <Input
                      id="newPartIssuedDate"
                      type="date"
                      value={formatDateForInput(formData.newPartIssuedDate as Date | undefined)}
                      onChange={(e) => updateDateField("newPartIssuedDate", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPartSerialNumber">New Part Serial #</Label>
                    <Input
                      id="newPartSerialNumber"
                      value={(formData.newPartSerialNumber as string) || ""}
                      onChange={(e) => updateField("newPartSerialNumber", e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="supplyComments">Supply Comments</Label>
                    <Textarea
                      id="supplyComments"
                      value={(formData.supplyComments as string) || ""}
                      onChange={(e) => updateField("supplyComments", e.target.value)}
                      rows={3}
                    />
                  </div>
                </>
              ) : (
                <>
                  <DetailField label="Signed 1149" value={fmr.signed1149} />
                  {fmr.signed1149 === "Sign Date" && (
                    <DetailField label="Sign Date" value={formatShortDate(fmr.signed1149Date)} />
                  )}
                  <DetailField label="Failed Part Received Date" value={formatShortDate(fmr.failedPartReceivedDate)} />
                  <DetailField label="New Part Received Date" value={formatShortDate(fmr.newPartReceivedDate)} />
                  <DetailField label="New Part Issued Date" value={formatShortDate(fmr.newPartIssuedDate)} />
                  <DetailField label="New Part Serial #" value={fmr.newPartSerialNumber} />
                  <div className="col-span-2">
                    <DetailField label="Supply Comments" value={fmr.supplyComments} />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Procurement</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {isEditing ? (
                <>
                  <div>
                    <Label htmlFor="poNumber">PO#</Label>
                    <Input
                      id="poNumber"
                      value={(formData.poNumber as string) || ""}
                      onChange={(e) => updateField("poNumber", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="warrantyStartDate">Warranty Start Date</Label>
                    <Input
                      id="warrantyStartDate"
                      type="date"
                      value={formatDateForInput(formData.warrantyStartDate as Date | undefined)}
                      onChange={(e) => updateDateField("warrantyStartDate", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="warrantyStopDate">Warranty Stop Date</Label>
                    <Input
                      id="warrantyStopDate"
                      type="date"
                      value={formatDateForInput(formData.warrantyStopDate as Date | undefined)}
                      onChange={(e) => updateDateField("warrantyStopDate", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPartOrderedDate">New Part Ordered Date</Label>
                    <Input
                      id="newPartOrderedDate"
                      type="date"
                      value={formatDateForInput(formData.newPartOrderedDate as Date | undefined)}
                      onChange={(e) => updateDateField("newPartOrderedDate", e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="vendorContactAddress">Vendor Contact Address</Label>
                    <Textarea
                      id="vendorContactAddress"
                      value={(formData.vendorContactAddress as string) || ""}
                      onChange={(e) => updateField("vendorContactAddress", e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="procurementComments">Procurement Comments</Label>
                    <Textarea
                      id="procurementComments"
                      value={(formData.procurementComments as string) || ""}
                      onChange={(e) => updateField("procurementComments", e.target.value)}
                      rows={3}
                    />
                  </div>
                </>
              ) : (
                <>
                  <DetailField label="PO#" value={fmr.poNumber} />
                  <DetailField label="Warranty Start Date" value={formatShortDate(fmr.warrantyStartDate)} />
                  <DetailField label="Warranty Stop Date" value={formatShortDate(fmr.warrantyStopDate)} />
                  <DetailField label="New Part Ordered Date" value={formatShortDate(fmr.newPartOrderedDate)} />
                  <div className="col-span-2">
                    <DetailField label="Vendor Contact Address" value={fmr.vendorContactAddress} />
                  </div>
                  <div className="col-span-2">
                    <DetailField label="Procurement Comments" value={fmr.procurementComments} />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Logistics</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {isEditing ? (
                <>
                  <div>
                    <Label htmlFor="requestDate">Request Date</Label>
                    <Input
                      id="requestDate"
                      type="date"
                      value={formatDateForInput(formData.requestDate as Date | undefined)}
                      onChange={(e) => updateDateField("requestDate", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="requestToVendorDate">Request To Vendor Date</Label>
                    <Input
                      id="requestToVendorDate"
                      type="date"
                      value={formatDateForInput(formData.requestToVendorDate as Date | undefined)}
                      onChange={(e) => updateDateField("requestToVendorDate", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="rmaReceivedDate">RMA Received Date</Label>
                    <Input
                      id="rmaReceivedDate"
                      type="date"
                      value={formatDateForInput(formData.rmaReceivedDate as Date | undefined)}
                      onChange={(e) => updateDateField("rmaReceivedDate", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="shippedToVendorDate">Shipped To Vendor Date</Label>
                    <Input
                      id="shippedToVendorDate"
                      type="date"
                      value={formatDateForInput(formData.shippedToVendorDate as Date | undefined)}
                      onChange={(e) => updateDateField("shippedToVendorDate", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tier1Date">Tier 1</Label>
                    <Input
                      id="tier1Date"
                      type="date"
                      value={formatDateForInput(formData.tier1Date as Date | undefined)}
                      onChange={(e) => updateDateField("tier1Date", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tier2Date">Tier 2</Label>
                    <Input
                      id="tier2Date"
                      type="date"
                      value={formatDateForInput(formData.tier2Date as Date | undefined)}
                      onChange={(e) => updateDateField("tier2Date", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tier3Date">Tier 3</Label>
                    <Input
                      id="tier3Date"
                      type="date"
                      value={formatDateForInput(formData.tier3Date as Date | undefined)}
                      onChange={(e) => updateDateField("tier3Date", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="completedDate">Completed Date</Label>
                    <Input
                      id="completedDate"
                      type="date"
                      value={formatDateForInput(formData.completedDate as Date | undefined)}
                      onChange={(e) => updateDateField("completedDate", e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="logisticsComment">Logistics Comment</Label>
                    <Textarea
                      id="logisticsComment"
                      value={(formData.logisticsComment as string) || ""}
                      onChange={(e) => updateField("logisticsComment", e.target.value)}
                      rows={3}
                    />
                  </div>
                </>
              ) : (
                <>
                  <DetailField label="Request Date" value={formatShortDate(fmr.requestDate)} />
                  <DetailField label="Request To Vendor Date" value={formatShortDate(fmr.requestToVendorDate)} />
                  <DetailField label="RMA Received Date" value={formatShortDate(fmr.rmaReceivedDate)} />
                  <DetailField label="Shipped To Vendor Date" value={formatShortDate(fmr.shippedToVendorDate)} />
                  <DetailField label="Tier 1" value={formatShortDate(fmr.tier1Date)} />
                  <DetailField label="Tier 2" value={formatShortDate(fmr.tier2Date)} />
                  <DetailField label="Tier 3" value={formatShortDate(fmr.tier3Date)} />
                  <DetailField label="Completed Date" value={formatShortDate(fmr.completedDate)} />
                  <div className="col-span-2">
                    <DetailField label="Logistics Comment" value={fmr.logisticsComment} />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contractor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <Label htmlFor="problemAssistanceRequested">Problem/Assistance Requested</Label>
                    <Input
                      id="problemAssistanceRequested"
                      value={(formData.problemAssistanceRequested as string) || ""}
                      onChange={(e) => updateField("problemAssistanceRequested", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contractorComments">Contractor Comments</Label>
                    <Textarea
                      id="contractorComments"
                      value={(formData.contractorComments as string) || ""}
                      onChange={(e) => updateField("contractorComments", e.target.value)}
                      rows={3}
                    />
                  </div>
                </>
              ) : (
                <>
                  <DetailField label="Problem/Assistance Requested" value={fmr.problemAssistanceRequested} />
                  <DetailField label="Problem Resolved" value={fmr.problemResolved ? "Yes" : "No"} />
                  <DetailField label="Contractor Comments" value={fmr.contractorComments} />
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  placeholder="Add a note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                />
                <Button
                  onClick={() => addNoteMutation.mutate(newNote)}
                  disabled={!newNote.trim() || addNoteMutation.isPending}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Note
                </Button>
              </div>

              <div className="space-y-3">
                {notes?.notes.map((note) => (
                  <div key={note.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{note.noteType}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(note.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm">{note.content}</p>
                    {note.author && (
                      <p className="text-xs text-muted-foreground mt-1">
                        By: {note.author}
                      </p>
                    )}
                  </div>
                ))}
                {(!notes?.notes || notes.notes.length === 0) && (
                  <p className="text-muted-foreground text-center py-4">
                    No notes yet.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Additional Tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <Label htmlFor="formSubmissionType">Form Submission Type</Label>
                    <Input
                      id="formSubmissionType"
                      value={(formData.formSubmissionType as string) || ""}
                      onChange={(e) => updateField("formSubmissionType", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fmrCreatedDate">FMR Created Date</Label>
                    <Input
                      id="fmrCreatedDate"
                      type="date"
                      value={formatDateForInput(formData.fmrCreatedDate as Date | undefined)}
                      onChange={(e) => updateDateField("fmrCreatedDate", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fmrReceivedDateByFailures">FMR Received Date By Failures</Label>
                    <Input
                      id="fmrReceivedDateByFailures"
                      type="date"
                      value={formatDateForInput(formData.fmrReceivedDateByFailures as Date | undefined)}
                      onChange={(e) => updateDateField("fmrReceivedDateByFailures", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="trackingNoType">Tracking No Type</Label>
                    <Input
                      id="trackingNoType"
                      value={(formData.trackingNoType as string) || ""}
                      onChange={(e) => updateField("trackingNoType", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="trackingNo">Tracking No</Label>
                    <Input
                      id="trackingNo"
                      value={(formData.trackingNo as string) || ""}
                      onChange={(e) => updateField("trackingNo", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="rmaNoType">RMA No Type</Label>
                    <Input
                      id="rmaNoType"
                      value={(formData.rmaNoType as string) || ""}
                      onChange={(e) => updateField("rmaNoType", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="rmaNo">RMA No</Label>
                    <Input
                      id="rmaNo"
                      value={(formData.rmaNo as string) || ""}
                      onChange={(e) => updateField("rmaNo", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="engineerDeployedType">Engineer Deployed Type</Label>
                    <Input
                      id="engineerDeployedType"
                      value={(formData.engineerDeployedType as string) || ""}
                      onChange={(e) => updateField("engineerDeployedType", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="engineerName">Engineer Name</Label>
                    <Input
                      id="engineerName"
                      value={(formData.engineerName as string) || ""}
                      onChange={(e) => updateField("engineerName", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="deploymentDate">Deployment Date</Label>
                    <Input
                      id="deploymentDate"
                      type="date"
                      value={formatDateForInput(formData.deploymentDate as Date | undefined)}
                      onChange={(e) => updateDateField("deploymentDate", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="recordEnteredBy">Record Entered By</Label>
                    <Input
                      id="recordEnteredBy"
                      value={(formData.recordEnteredBy as string) || ""}
                      onChange={(e) => updateField("recordEnteredBy", e.target.value)}
                    />
                  </div>
                </>
              ) : (
                <>
                  <DetailField label="Form Submission Type" value={fmr.formSubmissionType} />
                  <DetailField label="FMR Created Date" value={formatShortDate(fmr.fmrCreatedDate)} />
                  <DetailField label="FMR Received Date By Failures" value={formatShortDate(fmr.fmrReceivedDateByFailures)} />
                  <DetailField label="Tracking No Type" value={fmr.trackingNoType} />
                  <DetailField label="Tracking No" value={fmr.trackingNo} />
                  <DetailField label="RMA No Type" value={fmr.rmaNoType} />
                  <DetailField label="RMA No" value={fmr.rmaNo} />
                  <DetailField label="Engineer Deployed Type" value={fmr.engineerDeployedType} />
                  <DetailField label="Engineer Name" value={fmr.engineerName} />
                  <DetailField label="Deployment Date" value={formatShortDate(fmr.deploymentDate)} />
                  <DetailField label="Record Updated" value={formatDate(fmr.recordUpdated)} />
                  <DetailField label="Record Entered On" value={formatDate(fmr.recordEnteredOn)} />
                  <DetailField label="Record Entered By" value={fmr.recordEnteredBy} />
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}