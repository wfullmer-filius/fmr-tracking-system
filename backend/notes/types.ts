export type NoteType = "general" | "technician" | "customer";

export interface Note {
  id: number;
  fmrId: number;
  content: string;
  author?: string;
  noteType: NoteType;
  createdAt: Date;
}

export interface CreateNoteRequest {
  fmrId: number;
  content: string;
  author?: string;
  noteType?: NoteType;
}

export interface NotesListResponse {
  notes: Note[];
}
