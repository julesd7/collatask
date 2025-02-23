import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

import ProjectModal from '../components/ProjectModal';
import BoardModal from '../components/BoardModal';
import BoardCreationModal from '../components/BoardCreationModal';
import CardModal from '../components/CardModal';
import CardCreationModal from '../components/CardCreationModal';
import ChatModal from '../components/ChatModal';

import { ProjectI, BoardI, CardI } from '../utils/interfaces';

import profilePicture from '../assets/profile_icon_default.png';

import '../styles/Project.css';

const Project: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [projectName, setProjectName] = useState<string>('');
  const [projectDescription, setProjectDescription] = useState<string>('');
  const [teamMembers, setProjectsMembers] = useState<{ email: string; role: string }[]>([]);
  const [boards, setBoards] = useState<BoardI[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [getCardId, setCardId] = useState<number>(0);
  const [getBoardId, setBoardId] = useState<number>(0);
  const [holding, setHolding] = useState<boolean>(false);
  const [holdTimeout, setHoldTimeout] = useState<NodeJS.Timeout | null>(null);
  const [ProjectModalOpen, setProjectModalOpen] = useState<boolean>(false);
  const [BoardModalOpen, setBoardModalOpen] = useState<boolean>(false);
  const [BoardCreationModalOpen, setBoardCreationModalOpen] = useState<boolean>(false);
  const [CardModalOpen, setCardModalOpen] = useState<boolean>(false);
  const [CardCreationModalOpen, setCardCreationModalOpen] = useState<boolean>(false);
  const [selectedProject, setSelectedProject] = useState<ProjectI | null>(null);
  const [selectedBoard, setSelectedBoard] = useState<BoardI | null>(null);
  const [selectedCard, setSelectedCard] = useState<CardI | null>(null);
  const [ChatModalOpen, setChatModalOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBoardsAndCards = async () => {
      try {
        const projectResponse = await axios.get(`${import.meta.env.VITE_APP_URL}/api/projects/${id}`, {
          withCredentials: true,
        });
        setProjectName(projectResponse.data.project.title);
        setProjectDescription(projectResponse.data.project.description);

        const boardsResponse = await axios.get(`${import.meta.env.VITE_APP_URL}/api/boards/${id}`, {
          withCredentials: true,
        });

        if (boardsResponse.data.length === 0) {
          setBoards([]);
          retreiveProjectMembers();
          setLoading(false);
          return;
        }
        const boardsWithCards = await Promise.all(
          boardsResponse.data.map(async (board: BoardI) => {
            try {
              const cardsResponse = await axios.get(
          `${import.meta.env.VITE_APP_URL}/api/cards/${id}/${board.id}`,
          { withCredentials: true }
              );
              const cardsWithDates = cardsResponse.data.cards.map((card: any) => {
            const newCard = {
              ...card,
              startDate: card.start_date ? new Date(card.start_date) : null,
              endDate: card.end_date ? new Date(card.end_date) : null,
              assignedMembers: card.assignees_emails || []
            };
          return newCard;
              });
              return { ...board, cards: cardsWithDates || [] };
            } catch (err: any) {
              return { ...board, cards: [] };
            }
          })
        );

        setBoards(boardsWithCards);
      } catch (err: any) {
        if (err.response?.status === 404) {
          navigate('/unknown');
        } else if (err.response?.status === 500) {
          navigate('/forbidden');
        } else {
          setError("Error while loading the boards.");
        }
      }
      retreiveProjectMembers();
      setLoading(false);
    };

    fetchBoardsAndCards();
  }, [id]);

  useEffect(() => {
    return () => {
      localStorage.removeItem(`project-${id}-roles`);
    };
  }, [id]);
  

  const handleDragStart = (cardId: number, boardId: number) => {
    setCardId(cardId);
    setBoardId(boardId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetBoardId: number) => {
    const cardId = getCardId;
    const sourceBoardId = getBoardId;
  
    const targetBoardIndex = boards.findIndex(board => board.id === targetBoardId);
  
    if (targetBoardIndex === -1) {
      return;
    }
  
    const targetBoard = boards[targetBoardIndex];
  
    const sourceBoardIndex = boards.findIndex(board =>
      board.cards.some(card => card.id === cardId)
    );
  
    if (sourceBoardIndex === -1) {
      return;
    }
  
    const sourceBoard = boards[sourceBoardIndex];
    const cardIndex = sourceBoard.cards.findIndex(card => card.id === cardId);
    const [movedCard] = sourceBoard.cards.splice(cardIndex, 1);
  
    if (!Array.isArray(targetBoard.cards)) {
      targetBoard.cards = [];
    }
  
    targetBoard.cards.push(movedCard);
  
    setBoards([...boards]);
  
    axios.put(
      `${import.meta.env.VITE_APP_URL}/api/cards/move/${id}/${sourceBoardId}/${cardId}`,
      { new_board_id: targetBoardId },
      { withCredentials: true }
    );
  };  

  const retreiveProjectMembers = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_APP_URL}/api/project-assignments/${id}`, { withCredentials: true });
      setProjectsMembers(response.data.users);
  
      localStorage.setItem(`project-${id}-roles`, JSON.stringify(response.data.users));
    } catch (err) {
      alert("Error S1P2: Unable to retrieve project members.");
      console.error("Error S1P2: Unable to retrieve project members.");
    }
  };

  const handleProjectSettingsClick = () => {
    if (id) {
      setSelectedProject({
        id: id,
        title: projectName,
        description: projectDescription,
        newTeamMembers: teamMembers,
      });
      setProjectModalOpen(true);
    } else {
      alert("Error S1P1: Unable to open project settings.");
      console.error("Error S1P1: Unable to open project settings.");
    }
  };

  const handleProjectDeletion = () => {
    axios.delete(`${import.meta.env.VITE_APP_URL}/api/projects/${id}`, { withCredentials: true });
    localStorage.removeItem(`project-${id}-roles`);
    navigate('/');
    window.location.reload();
  };

  const handleSaveProject = (updatedTitle: string, updatedDescription: string, updatedTeamMembers: { email: string; role: string }[]) => {
    axios
      .put(
        `${import.meta.env.VITE_APP_URL}/api/projects/${id}`,
        { title: updatedTitle, description: updatedDescription },
        { withCredentials: true }
      )
      .then(() => {
        window.location.reload();
      });
  
    const previousRoles = JSON.parse(localStorage.getItem(`project-${id}-roles`) || '[]');
    
    const newUsers = updatedTeamMembers.filter(
      (updatedMember) => !previousRoles.some((member: any) => member.email === updatedMember.email)
    );
    const removedUsers = previousRoles.filter(
      (member: any) => !updatedTeamMembers.some((updatedMember) => updatedMember.email === member.email)
    );
    const modifiedUsers = updatedTeamMembers.filter((updatedMember) =>
      previousRoles.some((member: any) => member.email === updatedMember.email && member.role !== updatedMember.role)
    );
  
    newUsers.forEach(async (user) => {
      await axios.post(
        `${import.meta.env.VITE_APP_URL}/api/project-assignments/assign/${id}`,
        { email: user.email, role: user.role },
        { withCredentials: true }
      );
    });
  
    removedUsers.forEach(async (user: { email: string; role: string }) => {
      await axios.delete(
        `${import.meta.env.VITE_APP_URL}/api/project-assignments/remove/${id}`,
        { data: { email: user.email }, withCredentials: true }
      );
    });
  
    modifiedUsers.forEach(async (user: { email: string; role: string }) => {
      await axios.put(
        `${import.meta.env.VITE_APP_URL}/api/project-assignments/role/${id}`,
        { email: user.email, role: user.role },
        { withCredentials: true }
      );
    });

    localStorage.setItem(`project-${id}-roles`, JSON.stringify(updatedTeamMembers));
  };  


  const handleBoardSettingsClick = (board: BoardI) => {
    setSelectedBoard(board);
    setBoardModalOpen(true);
  };

  const handleBoardDeletion = (boardId: number) => {
    axios.delete(`${import.meta.env.VITE_APP_URL}/api/boards/${id}/${boardId}`, { withCredentials: true
    });
    setBoards((prevBoards) => prevBoards.filter((board) => board.id !== boardId));
  };

  const handleSaveBoard = (boardId: number, updatedTitle: string) => {
    setBoards((prevBoards) =>
      prevBoards.map((board) =>
        board.id === boardId ? { ...board, title: updatedTitle } : board
      )
    );

    axios.put(
      `${import.meta.env.VITE_APP_URL}/api/boards/${id}/${boardId}`,
      { title: updatedTitle },
      { withCredentials: true }
    );
  };

  const handleBoardCreation = async (title: string) => {
    setBoardCreationModalOpen(false);
    if (!title) return;
  
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_URL}/api/boards/${id}`,
        { title },
        { withCredentials: true }
      );
      const newBoard = { id: response.data.board_id, title, cards: [] };
      setBoards([...boards, newBoard]);
    } catch (err) {
      alert("Unable to create a new board.");
    }
  };

  const handleCardClick = (card: CardI) => {
    if (!holding) {
      setSelectedCard(card);
      if (BoardModalOpen) {
        setBoardModalOpen(false);
      }
      setCardModalOpen(true);
    }
  };

  const handleCardDeletion = (cardId: number) => {
    axios.delete(`${import.meta.env.VITE_APP_URL}/api/cards/${id}/${cardId}`, { withCredentials: true });
    setBoards(prevBoards =>
      prevBoards.map(board => ({
        ...board,
        cards: board.cards.filter(card => card.id !== cardId)
      }))
    );
  };

  const handleSaveCard = (cardId: number, updatedTitle: string, updatedDescription: string, updatedStartDate: Date | null, updatedEndDate: Date | null, oldAssignedMembers: string[] | null, newAssignedMembers: string[] | null) => {
    axios.put(
      `${import.meta.env.VITE_APP_URL}/api/cards/${id}/${cardId}`,
      { title: updatedTitle, description: updatedDescription, startDate: updatedStartDate, endDate: updatedEndDate },
      { withCredentials: true }
    );
    const newAssignees = newAssignedMembers?.filter(
      (newMember) => !oldAssignedMembers?.includes(newMember)
    ) || [];
    newAssignees.forEach(async (newAssignee) => {
      await axios.post(
        `${import.meta.env.VITE_APP_URL}/api/card-assignments/${id}/${cardId}`,
        { user_email: newAssignee },
        { withCredentials: true }
      );
    });
    const removedAssignees = oldAssignedMembers?.filter(
      (oldMember) => !newAssignedMembers?.includes(oldMember)
    ) || [];
    removedAssignees.forEach(async (removedAssignee) => {
      await axios.delete(
        `${import.meta.env.VITE_APP_URL}/api/card-assignments/${id}/${cardId}`,
        { data: { user_email: removedAssignee }, withCredentials: true }
      );
    });
  
    setBoards(prevBoards => prevBoards.map(board => ({
      ...board,
      cards: board.cards.map(card => 
        card.id === cardId ? { ...card, title: updatedTitle, description: updatedDescription, startDate: updatedStartDate, endDate: updatedEndDate, assignedMembers: newAssignedMembers } : card
      ),
    })));
  };

  const handleCardCreation = async (boardId: number, title: string, description: string, startDate: Date | null, endDate: Date | null, selectedMembers: string[] | null) => {
    setCardCreationModalOpen(false);
    if (!title) return;
  
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_URL}/api/cards/${id}/${boardId}`,
        { title, description, startDate, endDate, assignedMembers: selectedMembers },
        { withCredentials: true }
      );

      const newCard = { id: response.data.card_id, title, description: description || "", startDate, endDate, assignedMembers: selectedMembers };

      setBoards((prevBoards) =>
        prevBoards.map((board) =>
          board.id === boardId ? { ...board, cards: [...board.cards, newCard] } : board
        )
      );
    } catch (err) {
      alert("Unable to create a new card.");
    }
  };

  const handleCardCreationClick = (boardId: number) => {
    setCardCreationModalOpen(true);
    setBoardId(boardId);
  };

  const handleCardMouseDown = () => {
    const timeout = setTimeout(() => {
      setHolding(true);
    }, 500);

    setHoldTimeout(timeout);
  };

  const handleCardMouseUp = () => {
    if (holdTimeout) {
      clearTimeout(holdTimeout);
    }
    setHolding(false);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return (
      <div>
        <p>{error}</p>
        <button onClick={() => setBoardCreationModalOpen(true)}>Create a Board</button>
      </div>
    );
  }

  return (
    <div className="project-container">
      <div className="project-header">
        <button onClick={() => navigate('/')} className="header-button back-button">
          <span className="arrow">←</span> Home
        </button>
        <h1 className="project-title" onClick={()=> setChatModalOpen(true)}>{projectName}<br/><span>click here to open team chat</span></h1>
        {id && <button onClick={() => handleProjectSettingsClick()} className="header-button settings-button">Settings ⚙️</button>}
      </div>
      <div className="add-board-container">
          <button className="add-board-button" onClick={() => setBoardCreationModalOpen(true)}>+ Add a Board</button>
        </div>
      <div className="boards-container">
        {boards.map((board) => (
          <div
            key={board.id}
            className="board"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(board.id)}
          >
            <div className="board-header">
              <h2>{board.title}</h2>
              <button className="settings-button-board" onClick={() => handleBoardSettingsClick(board)}>⚙️</button>
            </div>
            <div className="cards-container">
              {board.cards.length > 0 ? (
                board.cards.map((card) => (
                  <div
                    key={card.id}
                    className="card"
                    draggable
                    onDragStart={() => handleDragStart(card.id, board.id)}
                    onMouseDown={handleCardMouseDown}
                    onMouseUp={handleCardMouseUp}
                    onClick={() => handleCardClick(card)}
                  >
                    <h3>{card.title}</h3>
                    <p>{card.description}</p>
                    <div className='timeLeft'>
                        {card.startDate || card.endDate ? <span className="clock-icon">🕒</span> : null}
                      {card.startDate && <p className='start-date'>{card.startDate.toLocaleDateString()}</p>}
                      {card.endDate && <p className='end-date'>{card.endDate.toLocaleDateString()}</p>}
                    </div>
                    {card.endDate && card.endDate < new Date() && (
                      <p className="overdue">Overdue</p>
                    )}
                    <div>
                      {card.assignedMembers && card.assignedMembers.length > 0 && (
                        <div className="assigned-members">
                            {card.assignedMembers.map((member: string) => (
                                <div key={card.id + member} className="assigned-member">
                                <img src={profilePicture} alt="Profile" className="profile-icon" />
                                <p key={member}>{member}</p>
                                </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p>No cards in this board.</p>
              )}
              <button onClick={() => handleCardCreationClick(board.id)} className="add-card-button">
                + Add a Card
              </button>
            </div>
          </div>
        ))}
      </div>
      {ProjectModalOpen && selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setProjectModalOpen(false)}
          onDelete={() => handleProjectDeletion()}
          onSave={handleSaveProject}
        />
      )}
      {BoardModalOpen && selectedBoard && (
        <BoardModal
          board={selectedBoard}
          onClose={() => setBoardModalOpen(false)}
          onDelete={(boardId) => handleBoardDeletion(boardId)}
          onSave={handleSaveBoard}
        />
      )}
      {BoardCreationModalOpen && (
        <BoardCreationModal
          onClose={() => setBoardCreationModalOpen(false)}
          onSave={handleBoardCreation}
        />
      )}
      {CardModalOpen && selectedCard && (
        <CardModal
          card={selectedCard}
          teamMembers={teamMembers}
          onClose={() => setCardModalOpen(false)}
          onDelete={(cardId) => handleCardDeletion(cardId)}
          onSave={handleSaveCard}
        />
      )}
      {CardCreationModalOpen && (
        <CardCreationModal
          card={{ BoardId: getBoardId, teamMembers }}
          onClose={() => setCardCreationModalOpen(false)}
          onSave={handleCardCreation}
        />
      )}
      {ChatModalOpen && (
        <ChatModal
          chat={{ room: id }}
          onClose={() => setChatModalOpen(false)}
        />
        )}
    </div>
  );
};

export default Project;
