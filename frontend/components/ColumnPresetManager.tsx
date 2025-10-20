import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Columns3, Check, Trash2, Star, Edit2, AlertCircle } from "lucide-react";
import backend from "~backend/client";
import type { ColumnPreset } from "~backend/column_presets/types";

interface ColumnPresetManagerProps {
  currentColumns: string[];
  onLoadPreset: (columns: string[]) => void;
  activePresetId?: number;
}

export default function ColumnPresetManager({
  currentColumns,
  onLoadPreset,
  activePresetId,
}: ColumnPresetManagerProps) {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<ColumnPreset | null>(null);
  const [editName, setEditName] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: presetsData, error: presetsError, isError: isPresetsError } = useQuery({
    queryKey: ["column-presets"],
    queryFn: async ({ signal }) => {
      console.log("[ColumnPresets] Fetching presets...");
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.warn("[ColumnPresets] List request timeout after 10s");
        controller.abort();
      }, 10000);

      if (signal) {
        signal.addEventListener('abort', () => {
          console.log("[ColumnPresets] Query cancelled by React Query");
          controller.abort();
        });
      }

      try {
        const result = await backend.column_presets.list();
        clearTimeout(timeoutId);
        console.log("[ColumnPresets] Fetched presets:", result);
        return result;
      } catch (error) {
        clearTimeout(timeoutId);
        console.error("[ColumnPresets] Error fetching presets:", error);
        throw error;
      }
    },
    retry: 2,
    retryDelay: 1000,
    staleTime: 30000,
    gcTime: 60000,
  });

  useEffect(() => {
    if (isPresetsError) {
      console.error("[ColumnPresets] Presets query error:", presetsError);
      toast({
        title: "Failed to Load Presets",
        description: "Unable to load column presets. Using defaults.",
        variant: "destructive",
      });
    }
  }, [isPresetsError, presetsError, toast]);

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; columns: string[]; isDefault?: boolean }) => {
      console.log("[ColumnPresets] Creating preset:", data);
      const result = await backend.column_presets.create(data);
      console.log("[ColumnPresets] Created preset:", result);
      return result;
    },
    onSuccess: () => {
      console.log("[ColumnPresets] Preset created successfully");
      
      // Close dialog immediately
      handleSaveDialogChange(false);
      
      // Invalidate in background (don't await)
      queryClient.invalidateQueries({ 
        queryKey: ["column-presets"],
        refetchType: 'active'
      });
      
      toast({
        title: "Preset Saved",
        description: "Column preset has been saved successfully.",
      });
    },
    onError: (error) => {
      console.error("[ColumnPresets] Error saving preset:", error);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save column preset. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: number; name?: string; isDefault?: boolean }) => {
      console.log("[ColumnPresets] Updating preset:", data);
      const result = await backend.column_presets.update(data);
      console.log("[ColumnPresets] Updated preset:", result);
      return result;
    },
    onSuccess: () => {
      console.log("[ColumnPresets] Preset updated successfully");
      
      // Close edit dialog immediately
      handleEditDialogChange(false);
      
      // Close manage dialog after successful update
      setManageDialogOpen(false);
      
      // Invalidate in background (don't await)
      queryClient.invalidateQueries({ 
        queryKey: ["column-presets"],
        refetchType: 'active'
      });
      
      toast({
        title: "Preset Updated",
        description: "Column preset has been updated successfully.",
      });
    },
    onError: (error) => {
      console.error("[ColumnPresets] Error updating preset:", error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update column preset. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log("[ColumnPresets] Deleting preset:", id);
      const result = await backend.column_presets.deletePreset({ id });
      console.log("[ColumnPresets] Deleted preset");
      return result;
    },
    onSuccess: () => {
      console.log("[ColumnPresets] Preset deleted successfully");
      
      // Close manage dialog after successful delete
      setManageDialogOpen(false);
      
      // Invalidate in background (don't await)
      queryClient.invalidateQueries({ 
        queryKey: ["column-presets"],
        refetchType: 'active'
      });
      
      toast({
        title: "Preset Deleted",
        description: "Column preset has been deleted successfully.",
      });
    },
    onError: (error) => {
      console.error("[ColumnPresets] Error deleting preset:", error);
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete column preset. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    console.log("[ColumnPresets] Dialog states:", {
      saveDialogOpen,
      manageDialogOpen,
      editDialogOpen,
      deleteDialogOpen,
    });
  }, [saveDialogOpen, manageDialogOpen, editDialogOpen, deleteDialogOpen]);

  useEffect(() => {
    console.log("[ColumnPresets] Mutation states:", {
      createPending: createMutation.isPending,
      updatePending: updateMutation.isPending,
      deletePending: deleteMutation.isPending,
    });
  }, [createMutation.isPending, updateMutation.isPending, deleteMutation.isPending]);

  const handleSavePreset = () => {
    console.log("[ColumnPresets] handleSavePreset called");
    if (!presetName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for the preset.",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate({
      name: presetName,
      columns: currentColumns,
      isDefault: setAsDefault,
    });
  };

  const handleSaveDialogChange = (open: boolean) => {
    console.log("[ColumnPresets] Save dialog change:", open);
    setSaveDialogOpen(open);
    if (open) {
      setDropdownOpen(false); // Close dropdown when opening dialog
    }
    if (!open) {
      console.log("[ColumnPresets] Cleaning up save dialog state");
      setPresetName("");
      setSetAsDefault(false);
    }
  };

  const handleEditDialogChange = (open: boolean) => {
    console.log("[ColumnPresets] Edit dialog change:", open);
    setEditDialogOpen(open);
    if (open) {
      setDropdownOpen(false); // Close dropdown when opening dialog
      setManageDialogOpen(false); // Close manage dialog when opening edit dialog
    }
    if (!open) {
      console.log("[ColumnPresets] Cleaning up edit dialog state");
      setSelectedPreset(null);
      setEditName("");
    }
  };

  const handleDeleteDialogChange = (open: boolean) => {
    console.log("[ColumnPresets] Delete dialog change:", open);
    setDeleteDialogOpen(open);
    if (open) {
      setDropdownOpen(false); // Close dropdown when opening dialog
      setManageDialogOpen(false); // Close manage dialog when opening delete dialog
    }
    if (!open) {
      console.log("[ColumnPresets] Cleaning up delete dialog state");
      setSelectedPreset(null);
    }
  };

  const handleManageDialogChange = (open: boolean) => {
    console.log("[ColumnPresets] Manage dialog change:", open);
    setManageDialogOpen(open);
    if (open) {
      setDropdownOpen(false); // Close dropdown when opening dialog
    }
    if (!open) {
      console.log("[ColumnPresets] Cleaning up manage dialog state");
    }
  };

  const handleLoadPreset = (preset: ColumnPreset) => {
    console.log("[ColumnPresets] Loading preset:", preset);
    onLoadPreset(preset.columns);
  };

  const handleDeleteClick = (preset: ColumnPreset) => {
    console.log("[ColumnPresets] Delete clicked for preset:", preset);
    setSelectedPreset(preset);
    setManageDialogOpen(false); // Close manage dialog when opening delete dialog
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (preset: ColumnPreset) => {
    console.log("[ColumnPresets] Edit clicked for preset:", preset);
    setSelectedPreset(preset);
    setEditName(preset.name);
    setManageDialogOpen(false); // Close manage dialog when opening edit dialog
    setEditDialogOpen(true);
  };

  const handleUpdatePreset = () => {
    console.log("[ColumnPresets] handleUpdatePreset called");
    if (!selectedPreset) return;

    if (!editName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for the preset.",
        variant: "destructive",
      });
      return;
    }

    updateMutation.mutate({
      id: selectedPreset.id,
      name: editName,
    });
  };

  const handleSetDefault = (preset: ColumnPreset) => {
    console.log("[ColumnPresets] Setting default preset:", preset);
    updateMutation.mutate({
      id: preset.id,
      isDefault: true,
    });
  };

  const handleConfirmDelete = () => {
    console.log("[ColumnPresets] handleConfirmDelete called");
    if (!selectedPreset) return;
    deleteMutation.mutate(selectedPreset.id);
  };

  const defaultPreset = presetsData?.presets.find((p: ColumnPreset) => p.isDefault);
  const hasPresets = presetsData?.presets && presetsData.presets.length > 0;

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Columns3 className="w-4 h-4 mr-2" />
            Column Presets
            {activePresetId && (
              <Check className="w-4 h-4 ml-2 text-primary" />
            )}
            {isPresetsError && (
              <AlertCircle className="w-4 h-4 ml-2 text-destructive" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Saved Presets</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {isPresetsError ? (
            <DropdownMenuItem disabled className="text-destructive">
              <AlertCircle className="w-4 h-4 mr-2" />
              Failed to load presets
            </DropdownMenuItem>
          ) : hasPresets ? (
            presetsData.presets.map((preset: ColumnPreset) => (
              <DropdownMenuItem
                key={preset.id}
                onClick={() => handleLoadPreset(preset)}
                className="flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  {preset.name}
                  {preset.isDefault && <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />}
                </span>
                {activePresetId === preset.id && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem disabled>No saved presets</DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleSaveDialogChange(true)}>
            Save Current as Preset
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleManageDialogChange(true)}>
            Manage Presets
          </DropdownMenuItem>
          {defaultPreset && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleLoadPreset(defaultPreset)}>
                Reset to Default
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={saveDialogOpen} onOpenChange={handleSaveDialogChange} modal={true}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Column Preset</DialogTitle>
            <DialogDescription>
              Save the current column configuration as a preset for quick access later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="preset-name">Preset Name</Label>
              <Input
                id="preset-name"
                placeholder="e.g., FMR Summary, Detailed View"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSavePreset();
                  }
                }}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="set-default"
                checked={setAsDefault}
                onChange={(e) => setSetAsDefault(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="set-default" className="cursor-pointer">
                Set as default preset
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => handleSaveDialogChange(false)}
              type="button"
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSavePreset} 
              disabled={createMutation.isPending}
              type="button"
            >
              {createMutation.isPending ? "Saving..." : "Save Preset"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={manageDialogOpen} onOpenChange={handleManageDialogChange} modal={true}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Column Presets</DialogTitle>
            <DialogDescription>
              Edit, delete, or set default for your saved column presets.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {isPresetsError ? (
              <div className="text-center py-8 text-destructive flex flex-col items-center gap-2">
                <AlertCircle className="w-8 h-8" />
                <div className="font-medium">Failed to load presets</div>
                <div className="text-sm text-muted-foreground">Please try again later</div>
              </div>
            ) : hasPresets ? (
              presetsData.presets.map((preset: ColumnPreset) => (
                <div
                  key={preset.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {preset.name}
                        {preset.isDefault && (
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {preset.columns.length} columns
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!preset.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetDefault(preset);
                        }}
                        type="button"
                        disabled={updateMutation.isPending}
                      >
                        <Star className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(preset);
                      }}
                      type="button"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(preset);
                      }}
                      disabled={activePresetId === preset.id}
                      type="button"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No saved presets yet. Save your first preset to get started.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              onClick={() => handleManageDialogChange(false)}
              type="button"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={handleEditDialogChange} modal={true}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Preset Name</DialogTitle>
            <DialogDescription>
              Change the name of this column preset.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Preset Name</Label>
              <Input
                id="edit-name"
                placeholder="Enter preset name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleUpdatePreset();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => handleEditDialogChange(false)}
              type="button"
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdatePreset} 
              disabled={updateMutation.isPending}
              type="button"
            >
              {updateMutation.isPending ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={handleDeleteDialogChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the preset "{selectedPreset?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => handleDeleteDialogChange(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}