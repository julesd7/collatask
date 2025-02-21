interface CardI {
  id: number;
  title: string;
  description: string;
  startDate: Date | null;
  endDate: Date | null;
  projectTeamMembers: TeamMember[];
  selectedTeamMembers: string[];
}

interface BoardI {
  id: number;
  title: string;
  cards: Card[];
}

interface ProjectI {
  id: string;
  title: string;
  description: string;
  newTeamMembers: TeamMember[];
}

interface TeamMember {
  email: string;
  role: string;
}

interface TeamMember {
  email: string;
  role: string;
}

interface User {
  username: string;
  email: string;
}

interface ProjectModalProps {
  project: {
    id: string;
    title: string;
    description: string;
    newTeamMembers: TeamMember[];
  };
  onSave: (
    title: string,
    description: string,
    teamMembers: TeamMember[]
  ) => void;
  onDelete: (projectId: string) => void;
  onClose: () => void;
}

interface BoardModalProps {
  board: { id: number; title: string };
  onSave: (boardId: number, title: string) => void;
  onDelete: (boardId: number) => void;
  onClose: () => void;
}

interface BoardCreationModalProps {
  onSave: (title: string) => void;
  onClose: () => void;
}

interface CardModalProps {
  card: { id: number; title: string; description: string; startDate: Date | null; endDate: Date | null };
  onSave: (cardId: number, title: string, description: string, startDate: Date | null, endDate: Date | null) => void;
  onDelete: (cardId: number) => void;
  onClose: () => void;
}

interface CardCreationModalProps {
  card: { BoardId: number; teamMembers: TeamMember[] };
  onSave: (boardId: number, title: string, description: string, startDate: Date | null, endDate: Date | null, selectedTeamMembers: string[] | null ) => void;
  onClose: () => void;
}

export interface UpdateProfileModalProps {
  user: { username: string; email: string; };
  onSave: (username: string, email: string,  oldPassword: string, newPassword: string) => void;
  onDelete: () => void;
  onClose: () => void;
}

export { CardI, BoardI, ProjectI, TeamMember, ProjectModalProps, BoardModalProps, BoardCreationModalProps, CardModalProps, CardCreationModalProps };
