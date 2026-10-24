import { createContext, useContext, useState, useEffect } from 'react';

const WordContext = createContext();
const API_URL = '';

export const useWord = () => useContext(WordContext);

export const WordProvider = ({ children }) => {
    const [words, setWords] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch all words from API on mount
    useEffect(() => {
        fetchWords();
    }, []);

    const fetchWords = async () => {
        try {
            const res = await fetch(`${API_URL}/api/words`);
            if (!res.ok) {
                throw new Error(`Server error: ${res.status}`);
            }
            const data = await res.json();
            setWords(data);
        } catch (error) {
            console.warn('Backend not reachable, failed to fetch words.');
        } finally {
            setLoading(false);
        }
    };

    const addWord = async (newWord) => {
        try {
            const res = await fetch(`${API_URL}/api/words`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newWord),
            });
            const saved = await res.json();
            setWords(prev => [saved, ...prev]);
            return saved;
        } catch (error) {
            console.error('Failed to add word:', error);
        }
    };

    const updateWord = async (id, updatedData) => {
        try {
            const res = await fetch(`${API_URL}/api/words/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData),
            });
            const updated = await res.json();
            setWords(prev => prev.map(word => word._id === id ? updated : word));
            return updated;
        } catch (error) {
            console.error('Failed to update word:', error);
        }
    };

    const deleteWord = async (id) => {
        try {
            await fetch(`${API_URL}/api/words/${id}`, { method: 'DELETE' });
            setWords(prev => prev.filter(word => word._id !== id));
        } catch (error) {
            console.error('Failed to delete word:', error);
        }
    };

    const getLatestWord = () => {
        const sorted = [...words].sort((a, b) => new Date(b.date) - new Date(a.date));
        return sorted[0] || null;
    };

    const getPreviousWords = () => {
        const sorted = [...words].sort((a, b) => new Date(b.date) - new Date(a.date));
        return sorted.slice(1);
    };

    const getWordById = (id) => {
        return words.find(word => word._id === id) || null;
    };

    return (
        <WordContext.Provider value={{ words, loading, addWord, updateWord, deleteWord, getLatestWord, getPreviousWords, getWordById, fetchWords }}>
            {children}
        </WordContext.Provider>
    );
};
