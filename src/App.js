import React, { useState, useEffect } from 'react';
import './App.css';
import { API } from 'aws-amplify';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import { listNotes } from './graphql/queries';
import { createNote as createNoteMutation, deleteNote as deleteNoteMutation, updateNote as updateNoteMutation } from './graphql/mutations';

const initialFormState = { name: '', description: '' }

function App() {
  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    const apiData = await API.graphql({ query: listNotes });
    const notesFromAPI = apiData.data.listNotes.items;
    await Promise.all(notesFromAPI.map(async note => {
      return note;
    }))
    setNotes(apiData.data.listNotes.items);
  }

  async function createNote() {
    if (!formData.name || !formData.description) return;
    await API.graphql({ query: createNoteMutation, variables: { input: formData } });
    setNotes([ ...notes, formData ]);
    setFormData(initialFormState);
  }

  function changeNoteName(noteId, newName){
    notes.forEach(note => {
      if(note === noteId){
        note.name = newName;
      } 
    });
    setNotes(notes);
  }

  function changeNoteDescription(noteId, newDsc){
    notes.forEach(note => {
      if(note === noteId){
        note.description = newDsc;
      } 
    });
    setNotes(notes);
  }

  async function updateNote(note) {
    await API.graphql({ query: updateNoteMutation, variables: { input: {id:note.id, name: note.name, description: note.description}  }});
    setNotes(notes);
  }

  async function deleteNote({ id }) {
    const newNotesArray = notes.filter(note => note.id !== id);
    setNotes(newNotesArray);
    await API.graphql({ query: deleteNoteMutation, variables: { input: { id } }});
  }

  return (
    <div className="App">
      <h1>My Notes App</h1>
      <input
        onChange={e => setFormData({ ...formData, 'name': e.target.value})}
        placeholder="Note name"
        value={formData.name}
      />
      <input
        onChange={e => setFormData({ ...formData, 'description': e.target.value})}
        placeholder="Note description"
        value={formData.description}
      />
      <button onClick={createNote}>Create Note</button>
      <div style={{marginBottom: 30}}>
        {
          notes.map(note => (
            <div key={note.id || note.name} style={{marginBottom: 20}}>
              <input
                onChange = {e => changeNoteName(note, e.target.value)}
                style={{marginRight: 10}}
                defaultValue={note.name}
              />
              <input
                onChange = {e => changeNoteDescription(note, e.target.value)}
                defaultValue={note.description}
              />
              <br/>
              {/* <p>{note.description}</p> */}
              <button onClick={() => updateNote(note)}>Update note</button>
              <button onClick={() => deleteNote(note)}>Delete note</button>
            </div>
          ))
        }
      </div>
      <AmplifySignOut />
    </div>
  );
}

export default withAuthenticator(App);