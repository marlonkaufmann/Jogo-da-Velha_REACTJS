// src/components/Placar.jsx

import React from 'react';

function Placar({ playerXName, playerOName, score }) {
    const scoreX = score.X;
    const scoreO = score.O;

    return (
        <div className="placar-container">
            <h3>Placar Atual</h3>
            <table className="score-table">
                <thead>
                    <tr>
                        <th>Jogador</th>
                        <th>Vitórias</th>
                        <th>Derrotas</th>
                        <th>Empates</th>
                        <th>Partidas</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{playerXName} (X)</td>
                        <td>{scoreX.wins}</td>
                        <td>{scoreX.losses}</td>
                        <td>{scoreX.draws}</td>
                        <td>{scoreX.games}</td>
                    </tr>
                    <tr>
                        <td>{playerOName} (O)</td>
                        <td>{scoreO.wins}</td>
                        <td>{scoreO.losses}</td>
                        <td>{scoreO.draws}</td>
                        <td>{scoreO.games}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export default Placar;