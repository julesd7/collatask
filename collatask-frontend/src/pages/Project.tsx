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
        // Récupérer les boards
        const boardsResponse = await axios.get(`${import.meta.env.VITE_APP_URL}/api/boards/${id}`, {
          withCredentials: true,
        });

        // Ajouter un tableau vide de cartes à chaque board
        const boardsWithCards = await Promise.all(
          boardsResponse.data.map(async (board: Board) => {
            try {
              const cardsResponse = await axios.get(
                `${import.meta.env.VITE_APP_URL}/api/boards/${id}/${board.id}`,
                { withCredentials: true }
              );
              return { ...board, cards: cardsResponse.data };
            } catch (err: any) {
              // Si une erreur survient (ex: pas de cartes), on retourne un tableau vide
              return { ...board, cards: [] };
            }
          })
        );

        setBoards(boardsWithCards);
      } catch (err: any) {
        if (err.response?.status === 404) {
          navigate('/unknown');
        } else {
          setError("Erreur lors du chargement des tableaux.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBoardsAndCards();
  }, [id]);

  const addBoard = async () => {
    const title = prompt("Entrez le titre du nouveau tableau :");
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
      console.error("Erreur lors de la création du tableau :", err);
      alert("Impossible de créer un nouveau tableau.");
    }
  };

  const addCard = async (boardId: number) => {
    const title = prompt("Entrez le titre de la nouvelle carte :");
    if (!title) return;

    const description = prompt("Entrez la description de la carte (optionnel) :");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_URL}/api/cards/${id}/${boardId}`,
        { title, description },
        { withCredentials: true }
      );

      const newCard = { id: response.data.card_id, title, description: description || "" };

      // Mettre à jour le tableau avec la nouvelle carte
      setBoards((prevBoards) =>
        prevBoards.map((board) =>
          board.id === boardId ? { ...board, cards: [...board.cards, newCard] } : board
        )
      );
    } catch (err) {
      console.error("Erreur lors de la création de la carte :", err);
      alert("Impossible de créer une nouvelle carte.");
    }
  };

  if (loading) {
    return <p>Chargement...</p>;
  }

  if (error) {
    return (
      <div>
        <p>{error}</p>
        <button onClick={addBoard}>Créer un tableau</button>
      </div>
    );
  }

  return (
    <div className="project">
      <h1>Projet {id}</h1>
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
                <p>Aucune carte dans ce tableau.</p>
              )}
              <button onClick={() => addCard(board.id)} className="add-card-button">
                + Ajouter une carte
              </button>
            </div>
          </div>
        ))}
        <div className="add-board" onClick={addBoard}>
          <button className="add-button">+ Ajouter un tableau</button>
        </div>
      </div>
    </div>
  );
};

export default Project;
