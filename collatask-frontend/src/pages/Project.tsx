// Project.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

import '../styles/Project.css';

interface Card {
  id: number;
  title: string;
  description: string;
}

interface Board {
  id: number;
  title: string;
  cards: Card[];
}

const Project: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [projectName, setProjectName] = useState<string>('');
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [getCardId, setCardId] = useState<number>(0);
  const [getBoardId, setBoardId] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBoardsAndCards = async () => {
      try {
        const projectResponse = await axios.get(`${import.meta.env.VITE_APP_URL}/api/projects/${id}`, {
            withCredentials: true,
        });
        setProjectName(projectResponse.data.project.title);

        const boardsResponse = await axios.get(`${import.meta.env.VITE_APP_URL}/api/boards/${id}`, {
          withCredentials: true,
        });

        const boardsWithCards = await Promise.all(
          boardsResponse.data.map(async (board: Board) => {
            try {
              const cardsResponse = await axios.get(
                `${import.meta.env.VITE_APP_URL}/api/cards/${id}/${board.id}`,
                { withCredentials: true }
              );
              return { ...board, cards: cardsResponse.data };
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
      } finally {
        setLoading(false);
      }
    };

    fetchBoardsAndCards();
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
  
    targetBoard.cards.push(movedCard);
  
    setBoards([...boards]);

    console.log("Moving card", cardId, "from board", sourceBoardId, "to board", targetBoardId);

    axios.put(
      `${import.meta.env.VITE_APP_URL}/api/cards/move/${id}/${sourceBoardId}/${cardId}`,
      { new_board_id: targetBoardId },
      { withCredentials: true }
    );
  };
  

  const addBoard = async () => {
    const title = prompt("Enter the title for the new board:");
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

  const addCard = async (boardId: number) => {
    const title = prompt("Enter the title for the new card:");
    if (!title) return;

    const description = prompt("Enter the description of the card (optional):");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_URL}/api/cards/${id}/${boardId}`,
        { title, description },
        { withCredentials: true }
      );

      const newCard = { id: response.data.card_id, title, description: description || "" };

      setBoards((prevBoards) =>
        prevBoards.map((board) =>
          board.id === boardId ? { ...board, cards: [...board.cards, newCard] } : board
        )
      );
    } catch (err) {
      alert("Unable to create a new card.");
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return (
      <div>
        <p>{error}</p>
        <button onClick={addBoard}>Create a Board</button>
      </div>
    );
  }

  return (
    <div className="project-container">
      <div className="project-header">
        <button onClick={() => navigate('/')} className="header-button back-button">
          <span className="arrow">←</span> Home
        </button>
        <h1 className="project-title">{projectName}</h1>
        <button onClick={() => alert('Settings clicked!')} className="header-button settings-button">Settings ⚙️</button>
      </div>
      <div className="boards-container">
        {boards.map((board) => (
          <div
            key={board.id}
            className="board"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(board.id)}
          >
            <h2>{board.title}</h2>
            <div className="cards-container">
              {board.cards.length > 0 ? (
                board.cards.map((card) => (
                  <div
                    key={card.id}
                    className="card"
                    draggable
                    onDragStart={() => handleDragStart(card.id, board.id)}
                  >
                    <h3>{card.title}</h3>
                    <p>{card.description}</p>
                  </div>
                ))
              ) : (
                <p>No cards in this board.</p>
              )}
              <button onClick={() => addCard(board.id)} className="add-card-button">
                + Add a Card
              </button>
            </div>
          </div>
        ))}
        <div className="add-board-container" onClick={addBoard}>
          <button className="add-board-button">+ Add a Board</button>
        </div>
      </div>
    </div>
  );
};

export default Project;
