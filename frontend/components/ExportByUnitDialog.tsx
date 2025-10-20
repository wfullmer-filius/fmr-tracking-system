import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Loader2 } from "lucide-react";
import type { FMRRequest } from "~backend/fmr/types";
import { exportFMRsByUnit } from "../utils/exportByUnit";

interface ExportByUnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fmrs: FMRRequest[];
}

export default function ExportByUnitDialog({
  open,
  onOpenChange,
  fmrs,
}: ExportByUnitDialogProps) {
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [exporting, setExporting] = useState(false);

  const availableUnits = useMemo(() => {
    const units = new Set<string>();
    fmrs.forEach((fmr) => {
      if (fmr.unit && fmr.unit.trim() !== "") {
        units.add(fmr.unit);
      }
    });
    return Array.from(units).sort();
  }, [fmrs]);

  const unitFMRCount = useMemo(() => {
    if (!selectedUnit) return 0;
    return fmrs.filter((fmr) => fmr.unit === selectedUnit).length;
  }, [selectedUnit, fmrs]);

  const handleExport = async () => {
    if (!selectedUnit) return;

    setExporting(true);
    try {
      await exportFMRsByUnit(fmrs, selectedUnit);
      onOpenChange(false);
      setSelectedUnit("");
    } catch (error) {
      console.error("Export by unit failed:", error);
    } finally {
      setExporting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedUnit("");
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export FMRs by Unit</DialogTitle>
          <DialogDescription>
            Select a unit to export all FMRs associated with that unit to Excel
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="unit-select">Select Unit</Label>
            <Select value={selectedUnit} onValueChange={setSelectedUnit}>
              <SelectTrigger id="unit-select">
                <SelectValue placeholder="Choose a unit..." />
              </SelectTrigger>
              <SelectContent>
                {availableUnits.length === 0 ? (
                  <SelectItem value="no-units" disabled>
                    No units available
                  </SelectItem>
                ) : (
                  availableUnits.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedUnit && (
            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {unitFMRCount}
                </span>{" "}
                FMR{unitFMRCount !== 1 ? "s" : ""} will be exported for unit{" "}
                <span className="font-semibold text-foreground">
                  {selectedUnit}
                </span>
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={exporting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={!selectedUnit || exporting || availableUnits.length === 0}
          >
            {exporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export to Excel
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
