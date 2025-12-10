import React from 'react';
// src/components/Square.jsx

// 1. Aceita a nova prop 'isDisabled' (ou disabled, como preferir)
function Square({ value, onClick, isWinner, isDisabled }) {

    const className = `square ${isWinner ? 'winning-square' : ''}`;

    return (
        <button
            className={className}
            onClick={onClick}
            disabled={isDisabled} // 2. Aplica o atributo HTML 'disabled'
        >
            {value}
        </button>
    );
}

export default Square;