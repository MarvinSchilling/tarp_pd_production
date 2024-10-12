import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar"; // Importiere die Sidebar
import "./Training.css"; // CSS für die Training-Seite
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSortUp, faSortDown, faEdit, faPlus, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

const predefinedTrainings = [
    { id: 1, title: 'Grundausbildung' },
    { id: 2, title: 'Leitstelle-Theorie' },
    { id: 3, title: 'Leitstelle-Praxis' },
    { id: 4, title: 'Fahrausbildung' },
    { id: 5, title: 'Großer Waffenschein' },
    { id: 6, title: 'Taktik-Ausbildung' },
    { id: 7, title: 'Verhandlungspartner-Theorie' },
    { id: 8, title: 'Prison-Ausbildung' },
    { id: 9, title: 'Führen im Einsatz' },
    { id: 10, title: 'Sonderfall-Training' },
    { id: 11, title: 'Air-Unit-Schein' },
    { id: 12, title: 'Verhandlungspartner-Schein' },
    { id: 13, title: 'Einsatzleiter-Schein' },
    { id: 14, title: 'Supervisor-Prüfung' }
];

function Training({ user, setUser }) {
    const [trainings, setTrainings] = useState([]);
    const [sort, setSort] = useState({ column: null, direction: 'desc' });
    const [error, setError] = useState(null);
    const [allUsers, setAllUsers] = useState([]); // Initialize as an empty array
    const [allTrainings, setAllTrainings] = useState([]);
    const [selectedUser, setSelectedUser] = useState({ id: '', name: '' });
    const [selectedTraining, setSelectedTraining] = useState('');
    const [showAddButton, setShowAddButton] = useState(false);
    const [showEditButton, setShowEditButton] = useState(false);
    const [availableTrainings, setAvailableTrainings] = useState(predefinedTrainings);

    useEffect(() => {
        const fetchUserGroup = async () => {
            try {
                const response = await fetch(`http://localhost:3001/user-group/${user.id}`);
                if (!response.ok) {
                    throw new Error('Fehler beim Abrufen der Benutzergruppe');
                }
                const data = await response.json();
                const { userGroup } = data;
                const allowedGroups = ['Administrative Leitung', 'Abteilungsleitung', 'Ausbilder'];
                const allowedGroupsForEdit = ['Administrative Leitung', 'Abteilungsleitung'];
                if (allowedGroups.includes(userGroup)) {
                    setShowAddButton(true);
                } else {
                    setError('You do not have permission to view this page.');
                }

                if (userGroup && allowedGroupsForEdit.includes(userGroup)) {
                    setShowEditButton(true);
                } else {
                    setShowEditButton(false);
                }
            } catch (error) {
                setShowAddButton(false);
                setShowEditButton(false);
                console.error('Fehler beim Abrufen der Benutzergruppe:', error);
            }
        };

        const fetchAllUsers = async () => {
            try {
                const response = await fetch('http://localhost:3001/mitarbeiter');
                if (!response.ok) {
                    throw new Error('Error fetching users');
                }
                const data = await response.json();
                setAllUsers(data); // Assuming the response is an array of users
            } catch (error) {
                console.error('Error fetching users:', error);
                setError('Failed to fetch users. Please try again later.');
            }
        };

        fetchUserGroup();
        fetchAllUsers();
        fetchTrainings();
    }, [user]);

    const fetchTrainings = async () => {
        try {
            const response = await fetch('http://localhost:3001/all-trainings', { credentials: 'include' });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setTrainings(data.trainings);
        } catch (error) {
            console.error('Error fetching trainings:', error);
            setError('Failed to fetch trainings. Please try again later.');
        }
    };

    const handleSort = (column) => {
        setSort({ column, direction: sort.column === column && sort.direction === 'asc' ? 'desc' : 'asc' });
    };

    const handleAddTraining = async () => {
        try {
            const response = await fetch('http://localhost:3001/add-training', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ userId: selectedUser.id, title: selectedTraining }) // Set absolviert to true
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            await response.json();
            await fetchTrainings(); // Fetch the updated list of trainings
        } catch (error) {
            console.error('Error adding training:', error);
            setError('Failed to add training. Please try again later.');
        }
    };

    const handleEditTraining = async (trainingId, field, value) => {
        try {
            const response = await fetch(`http://localhost:3001/edit-training/${trainingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ field, value })
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            await response.json();
            await fetchTrainings(); // Fetch the updated list of trainings
        } catch (error) {
            console.error('Error editing training:', error);
            setError('Failed to edit training. Please try again later.');
        }
    };

    const handleUserChange = (event) => {
        const selectedUserId = event.target.value;
        if (selectedUserId === "") {
            setSelectedUser({ id: '', name: '' });
            setAvailableTrainings(predefinedTrainings);
        } else {
            const selectedUserName = allUsers.find(user => user.userId === selectedUserId).name;
            setSelectedUser({ id: selectedUserId, name: selectedUserName });
            filterAvailableTrainings(selectedUserId);
        }
    };

    const filterAvailableTrainings = (userId) => {
        const userTrainings = trainings.filter(training => training.userId === userId);
        const userTrainingTitles = userTrainings.map(training => training.title);
        const filteredTrainings = predefinedTrainings.filter(training => !userTrainingTitles.includes(training.title));
        setAvailableTrainings(filteredTrainings);
    };

    const sortedTrainings = trainings.sort((a, b) => {
        if (sort.column === 'name') {
            return sort.direction === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        } else if (sort.column === 'rang') {
            return sort.direction === 'asc' ? a.rang.localeCompare(b.rang) : b.rang.localeCompare(a.rang);
        } else if (sort.column === 'training') {
            return sort.direction === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
        } else if (sort.column === 'time') {
            return sort.direction === 'asc' ? new Date(a.createdAt) - new Date(b.createdAt) : new Date(b.createdAt) - new Date(a.createdAt);
        } else if (sort.column === 'completed') {
            return sort.direction === 'asc' ? (a.absolviert === b.absolviert ? 0 : a.absolviert ? 1 : -1) : (a.absolviert === b.absolviert ? 0 : a.absolviert ? -1 : 1);
        } else {
            return 0;
        }
    });
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('de-DE', options);
    };

    return (
        <div className="dashboard-layout">
            <Sidebar user={user} setUser={setUser} className="sidebar" />
            <div className="training-content">
                <h1>Trainings</h1>
                {error && <div className="error">{error}</div>}
                {!error && (
                    <>
                        {showAddButton && (
                            <div className="add-training">
                                <select onChange={handleUserChange}>
                                    <option value="">Select User</option>
                                    {allUsers && allUsers.map(user => (
                                        <option key={user.userId} value={user.userId}>{user.name}</option>
                                    ))}
                                </select>
                                <select value={selectedTraining} onChange={(e) => setSelectedTraining(e.target.value)}>
                                    <option value="">Select Training</option>
                                    {availableTrainings.map(training => (
                                        <option key={training.id} value={training.title}>{training.title}</option>
                                    ))}
                                </select>
                                <button className="add-button" onClick={handleAddTraining}><FontAwesomeIcon icon={faPlus} /> Add</button>
                            </div>
                        )}
                        <table>
                            <thead>
                                <tr>
                                    <th onClick={() => handleSort('name')}>
                                        Name
                                        {sort.column === 'name' && <FontAwesomeIcon icon={sort.direction === 'asc' ? faSortUp : faSortDown} />}
                                    </th>
                                    <th onClick={() => handleSort('rang')}>
                                        Rang
                                        {sort.column === 'rang' && <FontAwesomeIcon icon={sort.direction === 'asc' ? faSortUp : faSortDown} />}
                                    </th>
                                    <th onClick={() => handleSort('training')}>
                                        Ausbildung
                                        {sort.column === 'training' && <FontAwesomeIcon icon={sort.direction === 'asc' ? faSortUp : faSortDown} />}
                                    </th>
                                    <th onClick={() => handleSort('time')}>
                                        Zeitpunkt
                                        {sort.column === 'time' && <FontAwesomeIcon icon={sort.direction === 'asc' ? faSortUp : faSortDown} />}
                                    </th>
                                    <th onClick={() => handleSort('completed')}>
                                        Absolviert
                                        {sort.column === 'completed' && <FontAwesomeIcon icon={sort.direction === 'asc' ? faSortUp : faSortDown} />}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedTrainings.map(training => (
                                    <tr key={training.id}>
                                        <td>{training.name}</td>
                                        <td>{training.rang}</td>
                                        <td>{training.title}</td>
                                        <td>{formatDate(training.createdAt)}</td>
                                        <td>
                                            {training.absolviert ? (
                                                <FontAwesomeIcon icon={faCheck} style={{ color: 'green' }} />
                                            ) : (
                                                <FontAwesomeIcon icon={faTimes} style={{ color: 'red' }} />
                                            )}
                                        </td>
                                        <td>
                                            {showEditButton && (
                                                <button className="edit-button" onClick={() => handleEditTraining(training.id, 'edit', true)}>
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}
            </div>
        </div>
    );
}

export default Training;