interface CardI {
  id: number;
  title: string;
  description: string;
  startDate: Date | null;
  endDate: Date | null;
  assignedMembers: string[];
  priority: string;
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
  card: { id: number; title: string; description: string; startDate: Date | null; endDate: Date | null; assignedMembers: string[]; };
  teamMembers: { email: string; role: string }[];
  onSave: (cardId: number, title: string, description: string, startDate: Date | null, endDate: Date | null, oldAssignedMembers: string[] | null, newAssignedMembers: string[] | null ) => void;
  onDelete: (cardId: number) => void;
  onClose: () => void;
}

interface CardCreationModalProps {
  card: { BoardId: number; teamMembers: TeamMember[] };
  onSave: (boardId: number, title: string, description: string, startDate: Date | null, endDate: Date | null, assignedMembers: string[] | null, priority: string | null ) => void;
  onClose: () => void;
}

export interface UpdateProfileModalProps {
  user: { username: string; email: string; };
  onSave: (username: string, email: string,  oldPassword: string, newPassword: string) => void;
  onDelete: () => void;
  onClose: () => void;
}
export interface ChatModalProps {
  chat: { room: string | undefined; };
  onClose: () => void;
}

export { CardI, BoardI, ProjectI, TeamMember, ProjectModalProps, BoardModalProps, BoardCreationModalProps, CardModalProps, CardCreationModalProps };
