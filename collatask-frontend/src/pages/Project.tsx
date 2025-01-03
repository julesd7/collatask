// Project.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
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

  const handleDragEnd = (result: any) => {
    const { source, destination } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const boardsCopy = [...boards];
    const sourceBoardIndex = boardsCopy.findIndex(board => board.id === parseInt(source.droppableId));
    const destinationBoardIndex = boardsCopy.findIndex(board => board.id === parseInt(destination.droppableId));

    const [movedCard] = boardsCopy[sourceBoardIndex].cards.splice(source.index, 1);
    boardsCopy[destinationBoardIndex].cards.splice(destination.index, 0, movedCard);

    setBoards(boardsCopy);
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
      console.error("Error creating the board:", err);
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
      console.error("Error creating the card:", err);
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
      <h1 className="project-title">{projectName}</h1>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="boards-container">
          {boards.map((board) => (
            <Droppable key={board.id} droppableId={String(board.id)}>
              {(provided) => (
                <div
                  className="board"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <h2>{board.title}</h2>
                  <div className="cards-container">
                    {board.cards.map((card, index) => (
                      <Draggable key={card.id} draggableId={String(card.id)} index={index}>
                        {(provided) => (
                          <div
                            className="card"
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <h3>{card.title}</h3>
                            <p>{card.description}</p>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                  <button onClick={() => addCard(board.id)} className="add-card-button">
                    + Add a Card
                  </button>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
      <div className="add-board-container" onClick={addBoard}>
        <button className="add-board-button">+ Add a Board</button>
      </div>
    </div>
  );
};

export default Project;
