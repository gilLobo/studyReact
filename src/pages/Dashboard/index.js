import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import socketio from 'socket.io-client';
import api from '../../services/api';

import './styles.css';

export default function Dashboard(){
    // Controle de estado
    const [spots, setSpots] = useState([]);
    const [requests, setRequests] = useState([]);

    const user_id = localStorage.getItem('user');

    // useMemo => memoriza o valor de uma variavel, ele recebe uma função e retorna algum valor
    const socket = useMemo(() => socketio('http://localhost:3333', {
        query: { user_id },
        /* Segundo parametro do useMemo é um array de dependências. Nesse exemplo, quando houver mudança
        do user_id aí esse código será executado novamente, ou seja, abriria outro socket.
        */
    }), [user_id]);

    
    useEffect(() => {
        // WebSocket
        // funcao on('message', função)
        socket.on('booking_request', data => {

            setRequests([...requests, data]);
        })
        // Sempre que houver mudança nas variaveis de dependências o useEffect será executado de novo
    }, [requests, socket]);
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
    }, [setSpots]);

    async function handleAccept(id) {
        await api.post(`bookings/${id}/approvals`);

        // Substitui as informações de que está em request com todos os IDs diferentes desse que foi aprovado.
        setRequests(requests.filter(request => request._id !== id));
    }

    async function handleReject(id) {
        await api.post(`bookings/${id}/rejections`);
        
        // Substitui as informações de que está em request com todos os IDs diferentes desse que foi aprovado.
        setRequests(requests.filter(request => request._id !== id));
    }

    return (
        <>
            <ul className="notifications">
                {requests.map(request => (
                    <li key={request._id}>
                        <p>
                            <strong>{request.user.email}</strong> está solicitando uma reserva em <strong>{request.spot.company}</strong> para a data: <strong>{request.date}</strong>
                        </p>
                        <button className="accept" onClick={() => handleAccept(request._id)}>ACEITAR</button>
                        <button className="reject" onClick={() => handleReject(request._id)}>REJEITAR</button>
                    </li>
                ))}
                
            </ul>
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