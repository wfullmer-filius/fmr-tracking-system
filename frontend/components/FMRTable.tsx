import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Settings2, Filter, Search, X, ChevronDown, Download } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import ColumnPresetManager from "./ColumnPresetManager";
import backend from "~backend/client";
import type { FMRRequest, FMRStatus } from "~backend/fmr/types";

interface FMRTableProps {
  fmrs: FMRRequest[];
  isLoading: boolean;
  onRefresh: () => void;
  onExport?: (data: {
    fmrs: FMRRequest[];
    filteredFmrs: FMRRequest[];
    visibleColumns: ColumnConfig[];
  }) => void;
}

interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
}

const ALL_COLUMNS: ColumnConfig[] = [
  { key: "controlNumber", label: "Control #", visible: true },
  { key: "failedDate", label: "Failed Date", visible: true },
  { key: "unit", label: "UNIT", visible: true },
  { key: "ommodSn", label: "OMMOD SN#", visible: true },
  { key: "tierLevel", label: "Tier Level", visible: true },
  { key: "completedDate", label: "Completed Date", visible: true },
  { key: "status", label: "Status", visible: true },
  { key: "id", label: "ID", visible: false },
  { key: "program", label: "Program", visible: false },
  { key: "ommodSystemMeterHrs", label: "OMMOD System Meter Hrs", visible: false },
  { key: "technicianName", label: "Technician Name", visible: false },
  { key: "email", label: "Email", visible: false },
  { key: "commNumber", label: "Comm #", visible: false },
  { key: "dateReported", label: "Date Reported", visible: false },
  { key: "pointOfFailure", label: "Point Of Failure", visible: false },
  { key: "failedPartNomenclature", label: "Failed Part Nomenclature", visible: false },
  { key: "failedPartNumber", label: "Failed Part Number", visible: false },
  { key: "qty", label: "Qty", visible: false },
  { key: "partSerialNumber", label: "Part Serial #", visible: false },
  { key: "repairTechnician", label: "Repair Technician", visible: false },
  { key: "repairStartDate", label: "Repair Start Date", visible: false },
  { key: "repairAction", label: "Repair Action", visible: false },
  { key: "failedPartReceivedDate", label: "Failed Part Received Date", visible: false },
  { key: "newPartReceivedDate", label: "New Part Received Date", visible: false },
  { key: "newPartIssuedDate", label: "New Part Issued Date", visible: false },
  { key: "newPartSerialNumber", label: "New Part Serial #", visible: false },
  { key: "supplyComments", label: "Supply Comments", visible: false },
  { key: "poNumber", label: "PO#", visible: false },
  { key: "warrantyStartDate", label: "Warranty Start Date", visible: false },
  { key: "newPartOrderedDate", label: "New Part Ordered Date", visible: false },
  { key: "vendorContactAddress", label: "Vendor Contact Address", visible: false },
  { key: "procurementComments", label: "Procurement Comments", visible: false },
  { key: "requestDate", label: "Request Date", visible: false },
  { key: "requestToVendorDate", label: "Request To Vendor Date", visible: false },
  { key: "rmaReceivedDate", label: "RMA Received Date", visible: false },
  { key: "shippedToVendorDate", label: "Shipped To Vendor Date", visible: false },
  { key: "logisticsComment", label: "Logistics Comment", visible: false },
  { key: "tier1Date", label: "Tier 1 Date", visible: false },
  { key: "tier2Date", label: "Tier 2 Date", visible: false },
  { key: "tier3Date", label: "Tier 3 Date", visible: false },
  { key: "contractorComments", label: "Contractor Comments", visible: false },
  { key: "formSubmissionType", label: "Form Submission Type", visible: false },
  { key: "fmrCreatedDate", label: "FMR Created Date", visible: false },
  { key: "warrantyStopDate", label: "Warranty Stop Date", visible: false },
  { key: "fmrReceivedDateByFailures", label: "FMR Received Date By Failures", visible: false },
  { key: "repairActionOther", label: "Other Repair Action", visible: false },
  { key: "trackingNoType", label: "Tracking No Type", visible: false },
  { key: "trackingNo", label: "Tracking No", visible: false },
  { key: "rmaNoType", label: "RMA No Type", visible: false },
  { key: "rmaNo", label: "RMA No", visible: false },
  { key: "engineerDeployedType", label: "Engineer Deployed Type", visible: false },
  { key: "engineerName", label: "Engineer Name", visible: false },
  { key: "deploymentDate", label: "Deployment Date", visible: false },
  { key: "recordUpdated", label: "Record Updated", visible: false },
  { key: "recordEnteredOn", label: "Record Entered On", visible: false },
  { key: "recordEnteredBy", label: "Record Entered By", visible: false },
  { key: "creationDate", label: "Created", visible: false },
  { key: "resolutionDate", label: "Resolved", visible: false },
];

type ColumnFilters = Record<string, Set<string>>;

export default function FMRTable({ fmrs, isLoading, onRefresh, onExport }: FMRTableProps) {
  const navigate = useNavigate();
  const [columns, setColumns] = useState<ColumnConfig[]>(ALL_COLUMNS);
  const [columnFilters, setColumnFilters] = useState<ColumnFilters>({});
  const [globalSearch, setGlobalSearch] = useState("");
  const [columnSearches, setColumnSearches] = useState<Record<string, string>>({});
  const [activePresetId, setActivePresetId] = useState<number | undefined>();

  const { data: presetsData } = useQuery({
    queryKey: ["column-presets"],
    queryFn: async () => backend.column_presets.list(),
  });

  const hasLoadedDefault = useRef(false);

  const handleLoadPreset = useCallback((presetColumns: string[], presetId?: number) => {
    setColumns(cols =>
      cols.map(col => ({
        ...col,
        visible: presetColumns.includes(col.key),
      }))
    );
    setActivePresetId(presetId);
  }, []);

  useEffect(() => {
    const defaultPreset = presetsData?.presets.find((p: any) => p.isDefault);
    if (defaultPreset && !hasLoadedDefault.current) {
      handleLoadPreset(defaultPreset.columns, defaultPreset.id);
      hasLoadedDefault.current = true;
    }
  }, [presetsData, handleLoadPreset]);

  const handleColumnsChange = () => {
    setActivePresetId(undefined);
  };

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
    return new Date(date).toLocaleDateString();
  };

  const formatValue = (fmr: FMRRequest, key: string) => {
    const value = (fmr as any)[key];
    
    if (value === undefined || value === null) return "-";
    
    if (key === "tierLevel") {
      if (fmr.tier3Date) return "Tier 3";
      if (fmr.tier2Date) return "Tier 2";
      if (fmr.tier1Date) return "Tier 1";
      return "None";
    }
    
    if (key.includes("Date") || key === "creationDate" || key === "resolutionDate") {
      return formatDate(value);
    }
    
    if (key === "status") {
      return (
        <Badge variant={getStatusColor(value as FMRStatus)}>
          {value.replace("-", " ")}
        </Badge>
      );
    }
    
    if (key === "problemResolved") {
      return value ? "Yes" : "No";
    }
    
    if (typeof value === "string" && value.length > 50) {
      return value.substring(0, 50) + "...";
    }
    
    return value;
  };

  const toggleColumn = (key: string) => {
    setColumns(cols =>
      cols.map(col =>
        col.key === key ? { ...col, visible: !col.visible } : col
      )
    );
    handleColumnsChange();
  };

  const visibleColumns = columns.filter(col => col.visible);

  const getUniqueValues = (key: string) => {
    const values = new Set<string>();
    fmrs.forEach(fmr => {
      const value = formatValueAsString(fmr, key);
      if (value && value !== "-") {
        values.add(value);
      }
    });
    return Array.from(values).sort();
  };

  const formatValueAsString = (fmr: FMRRequest, key: string): string => {
    const value = (fmr as any)[key];
    
    if (value === undefined || value === null) return "-";
    
    if (key === "tierLevel") {
      if (fmr.tier3Date) return "Tier 3";
      if (fmr.tier2Date) return "Tier 2";
      if (fmr.tier1Date) return "Tier 1";
      return "None";
    }
    
    if (key.includes("Date") || key === "creationDate" || key === "resolutionDate") {
      return formatDate(value);
    }
    
    if (key === "status") {
      return (value as string).replace("-", " ");
    }
    
    if (key === "problemResolved") {
      return value ? "Yes" : "No";
    }
    
    return String(value);
  };

  const filteredFmrs = useMemo(() => {
    return fmrs.filter(fmr => {
      if (globalSearch) {
        const searchLower = globalSearch.toLowerCase();
        const matchesGlobal = visibleColumns.some(col => {
          const value = formatValueAsString(fmr, col.key);
          return value.toLowerCase().includes(searchLower);
        });
        if (!matchesGlobal) return false;
      }

      for (const [key, selectedValues] of Object.entries(columnFilters)) {
        if (selectedValues.size > 0) {
          const value = formatValueAsString(fmr, key);
          if (!selectedValues.has(value)) {
            return false;
          }
        }
      }

      return true;
    });
  }, [fmrs, columnFilters, globalSearch, visibleColumns]);

  const toggleColumnFilter = (columnKey: string, value: string) => {
    setColumnFilters(prev => {
      const newFilters = { ...prev };
      if (!newFilters[columnKey]) {
        newFilters[columnKey] = new Set();
      }
      const filterSet = new Set(newFilters[columnKey]);
      
      if (filterSet.has(value)) {
        filterSet.delete(value);
      } else {
        filterSet.add(value);
      }
      
      if (filterSet.size === 0) {
        delete newFilters[columnKey];
      } else {
        newFilters[columnKey] = filterSet;
      }
      
      return newFilters;
    });
  };

  const selectAllColumnValues = (columnKey: string) => {
    const uniqueValues = getUniqueValues(columnKey);
    setColumnFilters(prev => ({
      ...prev,
      [columnKey]: new Set(uniqueValues)
    }));
  };

  const clearColumnFilter = (columnKey: string) => {
    setColumnFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[columnKey];
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setColumnFilters({});
    setGlobalSearch("");
    setColumnSearches({});
  };

  const getActiveFilterCount = () => {
    return Object.keys(columnFilters).length + (globalSearch ? 1 : 0);
  };

  const getFilteredUniqueValues = (key: string) => {
    const searchTerm = columnSearches[key] || "";
    const allValues = getUniqueValues(key);
    
    if (!searchTerm) return allValues;
    
    return allValues.filter(val => 
      val.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (fmrs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No FMR requests found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {getActiveFilterCount() > 0 && (
            <Button variant="outline" size="sm" onClick={clearAllFilters}>
              <X className="w-4 h-4 mr-2" />
              Clear all filters ({getActiveFilterCount()})
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <ColumnPresetManager
            currentColumns={visibleColumns.map(c => c.key)}
            onLoadPreset={(cols) => handleLoadPreset(cols)}
            activePresetId={activePresetId}
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Search className="w-4 h-4 mr-2" />
                Global Search
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Search all columns</Label>
                <Input
                  placeholder="Type to search..."
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                />
              </div>
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings2 className="w-4 h-4 mr-2" />
                Customize Columns
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 max-h-96 overflow-y-auto">
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Toggle Columns</h4>
                <div className="space-y-2">
                  {columns.map(col => (
                    <div key={col.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={col.key}
                        checked={col.visible}
                        onCheckedChange={() => toggleColumn(col.key)}
                      />
                      <Label htmlFor={col.key} className="text-sm cursor-pointer">
                        {col.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
          {onExport && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onExport({ fmrs, filteredFmrs, visibleColumns })}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      {getActiveFilterCount() > 0 && (
        <div className="flex flex-wrap gap-2">
          {globalSearch && (
            <Badge variant="secondary" className="gap-1">
              Global: {globalSearch}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => setGlobalSearch("")}
              />
            </Badge>
          )}
          {Object.entries(columnFilters).map(([key, values]) => {
            const column = columns.find(c => c.key === key);
            if (!column || values.size === 0) return null;
            
            return (
              <Badge key={key} variant="secondary" className="gap-1">
                {column.label}: {values.size} selected
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => clearColumnFilter(key)}
                />
              </Badge>
            );
          })}
        </div>
      )}
      
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.map(col => (
                <TableHead key={col.key}>
                  <div className="flex items-center justify-between gap-2">
                    <span>{col.label}</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Filter className={`w-3 h-3 ${columnFilters[col.key]?.size > 0 ? 'text-primary' : 'text-muted-foreground'}`} />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="w-64 p-0" 
                        align="start"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="p-3 space-y-3">
                          <Input
                            placeholder={`Search ${col.label}...`}
                            value={columnSearches[col.key] || ""}
                            onChange={(e) => setColumnSearches(prev => ({
                              ...prev,
                              [col.key]: e.target.value
                            }))}
                            className="h-8"
                          />
                          
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs flex-1"
                              onClick={() => selectAllColumnValues(col.key)}
                            >
                              Select All
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs flex-1"
                              onClick={() => clearColumnFilter(col.key)}
                            >
                              Clear
                            </Button>
                          </div>
                          
                          <div className="max-h-64 overflow-y-auto space-y-1">
                            {getFilteredUniqueValues(col.key).map(value => (
                              <div key={value} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`${col.key}-${value}`}
                                  checked={columnFilters[col.key]?.has(value) || false}
                                  onCheckedChange={() => toggleColumnFilter(col.key, value)}
                                />
                                <Label 
                                  htmlFor={`${col.key}-${value}`} 
                                  className="text-sm cursor-pointer flex-1"
                                >
                                  {value}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFmrs.map((fmr) => (
              <TableRow
                key={fmr.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => navigate(`/fmr/${fmr.id}`)}
              >
                {visibleColumns.map(col => (
                  <TableCell key={col.key}>
                    {formatValue(fmr, col.key)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}