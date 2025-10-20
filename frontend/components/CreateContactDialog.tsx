import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import backend from "~backend/client";
import type { Team } from "~backend/contacts/types";

interface CreateContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function CreateContactDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateContactDialogProps) {
  const [title, setTitle] = useState("");
  const [sequenceNumber, setSequenceNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [workNumber, setWorkNumber] = useState("");
  const [organization, setOrganization] = useState("");
  const [notes, setNotes] = useState("");
  const [team, setTeam] = useState<Team>("The Filius Team");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await backend.contacts.create({
        title: title || undefined,
        sequenceNumber: sequenceNumber ? parseInt(sequenceNumber) : undefined,
        firstName,
        lastName,
        email: email || undefined,
        mobileNumber: mobileNumber || undefined,
        workNumber: workNumber || undefined,
        organization: organization || undefined,
        notes: notes || undefined,
        team,
      });

      setTitle("");
      setSequenceNumber("");
      setFirstName("");
      setLastName("");
      setEmail("");
      setMobileNumber("");
      setWorkNumber("");
      setOrganization("");
      setNotes("");
      setTeam("The Filius Team");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Create contact error:", error);
      toast({
        title: "Error",
        description: "Failed to create contact. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Contact</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-base font-semibold">Team Assignment *</Label>
            <RadioGroup value={team} onValueChange={(value) => setTeam(value as Team)} className="mt-3 space-y-3">
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent transition-colors">
                <RadioGroupItem value="The Filius Team" id="filius" />
                <Label htmlFor="filius" className="flex-1 cursor-pointer font-normal">
                  The Filius Team
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent transition-colors">
                <RadioGroupItem value="CRC AN/TYQ-23A Program Team" id="crc" />
                <Label htmlFor="crc" className="flex-1 cursor-pointer font-normal">
                  CRC AN/TYQ-23A Program Team
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="border-t pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Mr., Mrs., Dr."
                />
              </div>
              <div>
                <Label htmlFor="sequenceNumber">Sequence Number</Label>
                <Input
                  id="sequenceNumber"
                  type="number"
                  value={sequenceNumber}
                  onChange={(e) => setSequenceNumber(e.target.value)}
                  placeholder="Enter number"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter first name"
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter last name"
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="mobileNumber">Mobile Number</Label>
              <Input
                id="mobileNumber"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="Enter mobile number"
              />
            </div>
            <div>
              <Label htmlFor="workNumber">Work Number</Label>
              <Input
                id="workNumber"
                value={workNumber}
                onChange={(e) => setWorkNumber(e.target.value)}
                placeholder="Enter work number"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="organization">Organization</Label>
            <Input
              id="organization"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="Enter organization"
            />
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter notes (optional)"
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Contact"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
