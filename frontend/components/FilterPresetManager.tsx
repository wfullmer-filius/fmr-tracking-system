import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Star, Save, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import backend from "~backend/client";
import type { PresetFilters } from "~backend/presets/types";

interface FilterPresetManagerProps {
  currentFilters: PresetFilters;
  onApplyPreset: (filters: PresetFilters) => void;
}

export default function FilterPresetManager({
  currentFilters,
  onApplyPreset,
}: FilterPresetManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [selectedPresetId, setSelectedPresetId] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: presetsData } = useQuery({
    queryKey: ["filter-presets"],
    queryFn: () => backend.presets.list(),
  });

  const createMutation = useMutation({
    mutationFn: (name: string) =>
      backend.presets.create({ name, filters: currentFilters }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["filter-presets"] });
      toast({
        title: "Preset saved",
        description: "Your filter preset has been saved successfully.",
      });
      setIsDialogOpen(false);
      setPresetName("");
    },
    onError: (error) => {
      console.error("Failed to create preset:", error);
      toast({
        title: "Error",
        description: "Failed to save preset. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => backend.presets.deletePreset({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["filter-presets"] });
      toast({
        title: "Preset deleted",
        description: "Your filter preset has been deleted.",
      });
      setSelectedPresetId("");
    },
    onError: (error) => {
      console.error("Failed to delete preset:", error);
      toast({
        title: "Error",
        description: "Failed to delete preset. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for your preset.",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate(presetName);
  };

  const handleApplyPreset = (value: string) => {
    setSelectedPresetId(value);
    const preset = presetsData?.presets.find(
      (p) => p.id.toString() === value
    );
    if (preset) {
      onApplyPreset(preset.filters);
      toast({
        title: "Preset applied",
        description: `Filters from "${preset.name}" have been applied.`,
      });
    }
  };

  const handleDeletePreset = () => {
    if (!selectedPresetId) return;
    const id = parseInt(selectedPresetId);
    deleteMutation.mutate(id);
  };

  return (
    <div className="flex gap-2 items-center">
      <Select value={selectedPresetId} onValueChange={handleApplyPreset}>
        <SelectTrigger className="w-48 h-9">
          <Star className="w-4 h-4 mr-2" />
          <SelectValue placeholder="Load preset" />
        </SelectTrigger>
        <SelectContent>
          {presetsData?.presets.map((preset) => (
            <SelectItem key={preset.id} value={preset.id.toString()}>
              {preset.name}
            </SelectItem>
          ))}
          {(!presetsData?.presets || presetsData.presets.length === 0) && (
            <div className="px-2 py-1.5 text-sm text-muted-foreground">
              No saved presets
            </div>
          )}
        </SelectContent>
      </Select>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-9">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Filter Preset</DialogTitle>
            <DialogDescription>
              Save your current filter settings as a preset for quick access later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="preset-name">Preset Name</Label>
              <Input
                id="preset-name"
                placeholder="e.g., My Open FMRs, Critical Issues"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Current Filters</Label>
              <div className="text-sm text-muted-foreground space-y-1">
                {currentFilters.search && (
                  <div>Search: {currentFilters.search}</div>
                )}
                {currentFilters.statusFilter && currentFilters.statusFilter !== "all" && (
                  <div>Status: {currentFilters.statusFilter}</div>
                )}
                {currentFilters.programFilter && currentFilters.programFilter !== "all" && (
                  <div>Program: {currentFilters.programFilter}</div>
                )}
                {currentFilters.unitFilter && currentFilters.unitFilter !== "all" && (
                  <div>Unit: {currentFilters.unitFilter}</div>
                )}
                {currentFilters.pointOfFailureFilter &&
                  currentFilters.pointOfFailureFilter !== "all" && (
                    <div>Point of Failure: {currentFilters.pointOfFailureFilter}</div>
                  )}
                {currentFilters.repairActionFilter &&
                  currentFilters.repairActionFilter !== "all" && (
                    <div>Repair Action: {currentFilters.repairActionFilter}</div>
                  )}
                {!currentFilters.search &&
                  (!currentFilters.statusFilter || currentFilters.statusFilter === "all") &&
                  (!currentFilters.programFilter || currentFilters.programFilter === "all") &&
                  (!currentFilters.unitFilter || currentFilters.unitFilter === "all") &&
                  (!currentFilters.pointOfFailureFilter ||
                    currentFilters.pointOfFailureFilter === "all") &&
                  (!currentFilters.repairActionFilter ||
                    currentFilters.repairActionFilter === "all") && (
                    <div className="text-muted-foreground">No filters applied</div>
                  )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSavePreset}
              disabled={createMutation.isPending}
            >
              Save Preset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedPresetId && (
        <Button
          variant="ghost"
          size="sm"
          className="h-9"
          onClick={handleDeletePreset}
          disabled={deleteMutation.isPending}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}