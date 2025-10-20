import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, Users, Building2, Mail, Phone, Smartphone } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import backend from "~backend/client";
import CreateContactDialog from "../components/CreateContactDialog";
import EditContactDialog from "../components/EditContactDialog";
import type { Contact } from "~backend/contacts/types";

export default function Contacts() {
  const [search, setSearch] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const { toast } = useToast();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      return backend.contacts.list();
    },
  });

  const filteredContacts = useMemo(() => {
    if (!data?.contacts) return [];
    
    return data.contacts.filter((contact) => {
      if (!search) return true;
      const searchLower = search.toLowerCase();
      return (
        contact.firstName.toLowerCase().includes(searchLower) ||
        contact.lastName.toLowerCase().includes(searchLower) ||
        contact.email?.toLowerCase().includes(searchLower) ||
        contact.organization?.toLowerCase().includes(searchLower)
      );
    });
  }, [data?.contacts, search]);

  const filiusTeam = useMemo(() => {
    return filteredContacts.filter(c => c.team === "The Filius Team");
  }, [filteredContacts]);

  const crcTeam = useMemo(() => {
    return filteredContacts.filter(c => c.team === "CRC AN/TYQ-23A Program Team");
  }, [filteredContacts]);

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this contact?")) {
      try {
        await backend.contacts.deleteContact({ id });
        refetch();
        toast({
          title: "Contact Deleted",
          description: "Contact has been deleted successfully.",
        });
      } catch (error) {
        console.error("Delete contact error:", error);
        toast({
          title: "Error",
          description: "Failed to delete contact. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const ContactCard = ({ contact }: { contact: Contact }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {contact.title && `${contact.title} `}
              {contact.firstName} {contact.lastName}
              {contact.sequenceNumber && (
                <Badge variant="outline" className="text-xs">
                  #{contact.sequenceNumber}
                </Badge>
              )}
            </CardTitle>
            {contact.organization && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Building2 className="w-3.5 h-3.5" />
                <span>{contact.organization}</span>
              </div>
            )}
          </div>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingContact(contact)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(contact.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {contact.email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
              {contact.email}
            </a>
          </div>
        )}
        {contact.mobileNumber && (
          <div className="flex items-center gap-2 text-sm">
            <Smartphone className="w-4 h-4 text-muted-foreground" />
            <a href={`tel:${contact.mobileNumber}`} className="hover:underline">
              {contact.mobileNumber}
            </a>
          </div>
        )}
        {contact.workNumber && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <a href={`tel:${contact.workNumber}`} className="hover:underline">
              {contact.workNumber}
            </a>
          </div>
        )}
        {contact.notes && (
          <p className="text-sm text-muted-foreground mt-2 pt-2 border-t">
            {contact.notes}
          </p>
        )}
      </CardContent>
    </Card>
  );

  const TeamSection = ({ 
    title, 
    contacts, 
    color 
  }: { 
    title: string; 
    contacts: Contact[]; 
    color: "blue" | "purple";
  }) => (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color === "blue" ? "bg-blue-100" : "bg-purple-100"}`}>
          <Users className={`w-5 h-5 ${color === "blue" ? "text-blue-600" : "text-purple-600"}`} />
        </div>
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="text-sm text-muted-foreground">
            {contacts.length} {contacts.length === 1 ? "contact" : "contacts"}
          </p>
        </div>
      </div>
      
      {contacts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((contact) => (
            <ContactCard key={contact.id} contact={contact} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No contacts in this team.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contact Directory</h1>
          <p className="text-muted-foreground mt-1">
            Manage and organize team contacts
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Contact
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search contacts by name, email, or organization..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <TeamSection 
        title="The Filius Team" 
        contacts={filiusTeam} 
        color="blue"
      />

      <TeamSection 
        title="CRC AN/TYQ-23A Program Team" 
        contacts={crcTeam} 
        color="purple"
      />

      {filteredContacts.length === 0 && !isLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              {search ? "No contacts found matching your search." : "No contacts yet. Create your first contact to get started."}
            </p>
          </CardContent>
        </Card>
      )}

      <CreateContactDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          refetch();
          toast({
            title: "Contact Created",
            description: "New contact has been created successfully.",
          });
        }}
      />

      {editingContact && (
        <EditContactDialog
          contact={editingContact}
          open={!!editingContact}
          onOpenChange={(open) => !open && setEditingContact(null)}
          onSuccess={() => {
            refetch();
            setEditingContact(null);
            toast({
              title: "Contact Updated",
              description: "Contact has been updated successfully.",
            });
          }}
        />
      )}
    </div>
  );
}
