import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, FileSpreadsheet, Building2 } from "lucide-react";
import backend from "~backend/client";
import FMRTable from "../components/FMRTable";
import ExportFMRDialog from "../components/ExportFMRDialog";
import ExportByUnitDialog from "../components/ExportByUnitDialog";
import type { FMRStatus } from "~backend/fmr/types";
import { usePolling } from "../hooks/usePolling";
import { exportWeeklyFMRsToExcel } from "../utils/exportWeeklyExcel";

export default function Dashboard() {
  const navigate = useNavigate();
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportData, setExportData] = useState<any>(null);
  const [exportByUnitDialogOpen, setExportByUnitDialogOpen] = useState(false);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["fmrs"],
    queryFn: async () => {
      return backend.fmr.list({});
    },
  });

  usePolling({
    enabled: true,
    interval: 30000,
    onPoll: () => refetch(),
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

  const statusCounts = data?.fmrs.reduce(
    (acc, fmr) => {
      acc[fmr.status] = (acc[fmr.status] || 0) + 1;
      return acc;
    },
    {
      Draft: 0,
      Submitted: 0,
      Unresolved: 0,
      "In-Progress": 0,
      Resolved: 0,
      Archived: 0,
    } as Record<FMRStatus, number>
  ) || {
    Draft: 0,
    Submitted: 0,
    Unresolved: 0,
    "In-Progress": 0,
    Resolved: 0,
    Archived: 0,
  };



  const handleExportClick = (data: any) => {
    setExportData(data);
    setExportDialogOpen(true);
  };

  const handleWeeklyExport = async () => {
    try {
      await exportWeeklyFMRsToExcel(data?.fmrs || []);
    } catch (error) {
      console.error("Weekly export failed:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold">FMR Dashboard</h1>
          {isFetching && (
            <RefreshCw className="w-4 h-4 text-muted-foreground animate-spin" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleWeeklyExport}
            className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Export Weekly FMRs
          </Button>
          <Button
            variant="outline"
            onClick={() => setExportByUnitDialogOpen(true)}
            className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
          >
            <Building2 className="w-4 h-4 mr-2" />
            Export FMRs by Unit
          </Button>
          <Button onClick={() => navigate("/new-fmr")}>
            <Plus className="w-4 h-4 mr-2" />
            New FMR
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total FMRs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {statusCounts.Draft || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Submitted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {statusCounts.Submitted || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Unresolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {statusCounts.Unresolved || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {statusCounts["In-Progress"] || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {statusCounts.Resolved || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>FMR Requests ({data?.total || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <FMRTable
              fmrs={data?.fmrs || []}
              isLoading={isLoading}
              onRefresh={refetch}
              onExport={handleExportClick}
            />
          </CardContent>
        </Card>
      </div>

      {exportData && (
        <ExportFMRDialog
          open={exportDialogOpen}
          onOpenChange={setExportDialogOpen}
          fmrs={exportData.fmrs}
          filteredFmrs={exportData.filteredFmrs}
          availableColumns={exportData.visibleColumns}
          statusCounts={statusCounts}
        />
      )}

      <ExportByUnitDialog
        open={exportByUnitDialogOpen}
        onOpenChange={setExportByUnitDialogOpen}
        fmrs={data?.fmrs || []}
      />
    </div>
  );
}