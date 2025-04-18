import React, { useEffect, useState } from 'react';
import { db } from '../../../lib/firebase';
import {
  collection, getDocs, addDoc, updateDoc, doc
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

interface Client {
  id: string;
  name: string;
}

interface Team {
  id: string;
  name: string;
}

export function CreateProjectForm() {
  const [name, setName] = useState('');
  const [clientId, setClientId] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamId, setTeamId] = useState('');
  const [type, setType] = useState('Installation');
  const [startDate, setStartDate] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClients = async () => {
      const snapshot = await getDocs(collection(db, 'clients'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Client[];
      setClients(data);
    };

    const fetchTeams = async () => {
      const snapshot = await getDocs(collection(db, 'teams'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Team[];
      setTeams(data);
    };

    fetchClients();
    fetchTeams();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedClient = clients.find(c => c.id === clientId);
      const selectedTeam = teams.find(t => t.id === teamId);

      if (!selectedClient) return alert("Client invalide");
      if (!selectedTeam) return alert("Équipe invalide");

      const docRef = await addDoc(collection(db, 'projects'), {
        name,
        client: selectedClient,
        team: selectedTeam,
        type,
        startDate,
        status: 'en_attente',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await updateDoc(doc(db, 'teams', teamId), {
        projects: arrayUnion(docRef.id)
      });

      await updateDoc(docRef, { id: docRef.id });

      navigate('/projects');
    } catch (error) {
      console.error('Erreur ajout projet :', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-xl space-y-4">
      <h2 className="text-xl font-semibold">Créer un nouveau projet</h2>

      <div>
        <label className="block text-sm font-medium mb-1">Nom du projet</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full border px-3 py-2 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Client</label>
        <select
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          required
          className="w-full border px-3 py-2 rounded-md"
        >
          <option value="">Sélectionner un client</option>
          {clients.map(client => (
            <option key={client.id} value={client.id}>{client.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Équipe</label>
        <select
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
          required
          className="w-full border px-3 py-2 rounded-md"
        >
          <option value="">Sélectionner une équipe</option>
          {teams.map(team => (
            <option key={team.id} value={team.id}>{team.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Type de projet</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full border px-3 py-2 rounded-md"
        >
          <option value="Installation">Installation</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Réparation">Réparation</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Date de début</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
          className="w-full border px-3 py-2 rounded-md"
        />
      </div>

      <div className="text-right">
        <button
          type="submit"
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
        >
          Créer le projet
        </button>
      </div>
    </form>
  );
}
