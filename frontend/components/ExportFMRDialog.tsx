import { useState } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Download, Loader2 } from "lucide-react";
import type { FMRRequest } from "~backend/fmr/types";

interface ExportFMRDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fmrs: FMRRequest[];
  filteredFmrs: FMRRequest[];
  availableColumns: Array<{ key: string; label: string }>;
  statusCounts: Record<string, number>;
}

type ExportFormat = "excel" | "csv";
type DataScope = "filtered" | "all";

interface ChartOption {
  id: string;
  label: string;
  enabled: boolean;
}

export default function ExportFMRDialog({
  open,
  onOpenChange,
  fmrs,
  filteredFmrs,
  availableColumns,
  statusCounts,
}: ExportFMRDialogProps) {
  const [format, setFormat] = useState<ExportFormat>("excel");
  const [dataScope, setDataScope] = useState<DataScope>("filtered");
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(
    new Set(availableColumns.map((col) => col.key))
  );
  const [includeSummary, setIncludeSummary] = useState(true);
  const [includeCharts, setIncludeCharts] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [chartOptions, setChartOptions] = useState<ChartOption[]>([
    { id: "statusDistribution", label: "Status distribution pie chart", enabled: true },
    { id: "fmrsOverTime", label: "FMRs over time line chart", enabled: true },
    { id: "fmrsByUnit", label: "FMRs by Unit bar chart", enabled: true },
    { id: "fmrsByTier", label: "FMRs by Tier Level bar chart", enabled: true },
  ]);

  const toggleColumn = (key: string) => {
    const newSelected = new Set(selectedColumns);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelectedColumns(newSelected);
  };

  const toggleAllColumns = () => {
    if (selectedColumns.size === availableColumns.length) {
      setSelectedColumns(new Set());
    } else {
      setSelectedColumns(new Set(availableColumns.map((col) => col.key)));
    }
  };

  const toggleChart = (chartId: string) => {
    setChartOptions((prev) =>
      prev.map((chart) =>
        chart.id === chartId ? { ...chart, enabled: !chart.enabled } : chart
      )
    );
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const dataToExport = dataScope === "filtered" ? filteredFmrs : fmrs;
      const columnsToExport = availableColumns.filter((col) =>
        selectedColumns.has(col.key)
      );

      if (format === "excel") {
        const { exportToExcel } = await import("../utils/exportExcel");
        await exportToExcel({
          fmrs: dataToExport,
          columns: columnsToExport,
          includeSummary,
          includeCharts,
          chartOptions: includeCharts
            ? chartOptions.filter((c) => c.enabled)
            : [],
          statusCounts,
        });
      } else if (format === "csv") {
        const { exportToCSV } = await import("../utils/exportCSV");
        await exportToCSV({
          fmrs: dataToExport,
          columns: columnsToExport,
        });
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Export FMR Data</DialogTitle>
          <DialogDescription>
            Configure export options for your FMR data
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4 overflow-y-auto">
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label className="text-base font-semibold">Export Format</Label>
              <RadioGroup value={format} onValueChange={(v) => setFormat(v as ExportFormat)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="excel" id="excel" />
                  <Label htmlFor="excel" className="font-normal cursor-pointer">
                    Excel (.xlsx)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="csv" id="csv" />
                  <Label htmlFor="csv" className="font-normal cursor-pointer">
                    CSV
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-base font-semibold">Data Scope</Label>
              <RadioGroup value={dataScope} onValueChange={(v) => setDataScope(v as DataScope)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="filtered" id="filtered" />
                  <Label htmlFor="filtered" className="font-normal cursor-pointer">
                    Current view ({filteredFmrs.length} FMRs)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all" className="font-normal cursor-pointer">
                    All FMRs ({fmrs.length} FMRs)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Columns to Include</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleAllColumns}
                >
                  {selectedColumns.size === availableColumns.length ? "Deselect All" : "Select All"}
                </Button>
              </div>
              <ScrollArea className="h-48 border rounded-md p-3">
                <div className="space-y-2">
                  {availableColumns.map((col) => (
                    <div key={col.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={`col-${col.key}`}
                        checked={selectedColumns.has(col.key)}
                        onCheckedChange={() => toggleColumn(col.key)}
                      />
                      <Label
                        htmlFor={`col-${col.key}`}
                        className="font-normal cursor-pointer text-sm"
                      >
                        {col.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-base font-semibold">Additional Options</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="summary"
                    checked={includeSummary}
                    onCheckedChange={(checked) => setIncludeSummary(!!checked)}
                  />
                  <Label htmlFor="summary" className="font-normal cursor-pointer">
                    Include summary statistics
                  </Label>
                </div>
                {format !== "csv" && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="charts"
                      checked={includeCharts}
                      onCheckedChange={(checked) => setIncludeCharts(!!checked)}
                    />
                    <Label htmlFor="charts" className="font-normal cursor-pointer">
                      Include charts/graphs
                    </Label>
                  </div>
                )}
              </div>
            </div>

            {includeCharts && format !== "csv" && (
              <>
                <Separator />
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Charts to Include</Label>
                  <div className="space-y-2 pl-4">
                    {chartOptions.map((chart) => (
                      <div key={chart.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`chart-${chart.id}`}
                          checked={chart.enabled}
                          onCheckedChange={() => toggleChart(chart.id)}
                        />
                        <Label
                          htmlFor={`chart-${chart.id}`}
                          className="font-normal cursor-pointer text-sm"
                        >
                          {chart.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={exporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={exporting || selectedColumns.size === 0}>
            {exporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
