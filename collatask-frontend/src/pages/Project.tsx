// Project.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

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
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBoardsAndCards = async () => {
      try {
        const boardsResponse = await axios.get(`${import.meta.env.VITE_APP_URL}/api/boards/${id}`, {
          withCredentials: true,
        });

        const boardsWithCards = await Promise.all(
          boardsResponse.data.map(async (board: Board) => {
            try {
              const cardsResponse = await axios.get(
                `${import.meta.env.VITE_APP_URL}/api/boards/${id}/${board.id}`,
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
        } else {
          setError("Error while loading the boards.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBoardsAndCards();
  }, [id]);

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
    <div className="project">
      <h1>Project {id}</h1>
      <div className="boards">
        {boards.map((board) => (
          <div key={board.id} className="board">
            <h2>{board.title}</h2>
            <div className="cards">
              {board.cards.length > 0 ? (
                board.cards.map((card) => (
                  <div key={card.id} className="card">
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
        <div className="add-board" onClick={addBoard}>
          <button className="add-button">+ Add a Board</button>
        </div>
      </div>
    </div>
  );
};

export default Project;
