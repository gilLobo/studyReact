import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import './styles.css';

export default function Dashboard(){
    // Controle de estado
    const [spots, setSpots] = useState([]);

    // useEffect utilizado para fazer a chamada na API assim que entra na rota
    // Por padrao recebe uma funcao e um array, como nao pode utilizar await na primeira funcao de parametro
    // é comum passar uma nova funcao dentro dela como async
    useEffect(() => {
        async function loadSpots() {
            const user_id = localStorage.getItem('user');
            const response = await api.get('/dashboards', {
                headers: { user_id }
            });
            setSpots(response.data);
        }

        loadSpots();
    }, []);
    return (
        <>
            <ul className="spot-list">
                {spots.map(spot => (
                    <li key={spot._id}>
                        <header style={{ backgroundImage: `url(${spot.thumbnail_url})` }} />
                        <strong>{spot.company}</strong>
                        <span>{spot.price ? `R$${spot.price}/dia` : 'GRATUITO'}</span>
                    </li>
                ))}
            </ul>

            {/* Importação do link para chamada de uma nova rota */}
            <Link to='/new'>
                <button className="btn">Cadastrar Novo Spot</button>
            </Link>
        </>
    );
}