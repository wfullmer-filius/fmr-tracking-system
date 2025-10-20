export type Team = "The Filius Team" | "CRC AN/TYQ-23A Program Team";

export interface Contact {
  id: number;
  title?: string;
  sequenceNumber?: number;
  firstName: string;
  lastName: string;
  email?: string;
  mobileNumber?: string;
  workNumber?: string;
  organization?: string;
  notes?: string;
  team: Team;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateContactRequest {
  title?: string;
  sequenceNumber?: number;
  firstName: string;
  lastName: string;
  email?: string;
  mobileNumber?: string;
  workNumber?: string;
  organization?: string;
  notes?: string;
  team: Team;
}

export interface UpdateContactRequest {
  id: number;
  title?: string;
  sequenceNumber?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  mobileNumber?: string;
  workNumber?: string;
  organization?: string;
  notes?: string;
  team?: Team;
}

export interface ContactsListResponse {
  contacts: Contact[];
  total: number;
}
