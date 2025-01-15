interface CardI {
  id: number;
  title: string;
  description: string;
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

interface ProjectModalProps {
  project: {
    id: string;
    title: string;
    description: string;
    newTeamMembers: TeamMember[];
  };
  onSave: (
    projectId: string,
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

interface CardModalProps {
  card: { id: number; title: string; description: string };
  onSave: (cardId: number, title: string, description: string) => void;
  onDelete: (cardId: number) => void;
  onClose: () => void;
}

export { CardI, BoardI, ProjectI, TeamMember, ProjectModalProps, BoardModalProps, CardModalProps };
