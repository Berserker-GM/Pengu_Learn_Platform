import React, { useState } from 'react';
import { useWord } from '../context/WordContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Edit, Plus, Calendar, Save, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '../lib/utils';

export default function WordAdmin() {
    const { words, addWord, updateWord, deleteWord } = useWord();
    // Simple auth state for demo
    const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('isAdminAuthenticated') === 'true');
    const [password, setPassword] = useState('');

    // Editor State
    const [isEditing, setIsEditing] = useState(false);
    const [currentWord, setCurrentWord] = useState(null);
    const fileInputRef = React.useRef(null);

    // Form State
    const initialFormState = {
        title: '',
        date: new Date().toISOString().split('T')[0],
        category: 'Entrepreneurship',
        definition: '',
        explanation: '',
        imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop', // Default placeholder
        readMoreUrl: '',
        example: ''
    };
    const [formData, setFormData] = useState(initialFormState);

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === 'ecell2026') { // Simple hardcoded password
            setIsAuthenticated(true);
            localStorage.setItem('isAdminAuthenticated', 'true');
        } else {
            alert('Incorrect Password');
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('isAdminAuthenticated');
    };

    const handleEditClick = (word) => {
        setCurrentWord(word);
        setFormData(word);
        setIsEditing(true);
    };

    const handleAddNewClick = () => {
        setCurrentWord(null);
        setFormData(initialFormState);
        setIsEditing(true);
    };

    const handleDeleteClick = async (id) => {
        if (window.confirm('Are you sure you want to delete this word?')) {
            await deleteWord(id);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (currentWord) {
            await updateWord(currentWord._id, formData);
        } else {
            await addWord(formData);
        }
        setIsEditing(false);
        setFormData(initialFormState);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, imageUrl: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <form onSubmit={handleLogin} className="bg-neutral-900 border border-neutral-600 p-8 rounded-xl w-full max-w-md space-y-6">
                    <h1 className="text-2xl font-bold text-white text-center">Admin Access</h1>
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black border border-neutral-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-white transition-colors"
                            placeholder="Enter password"
                        />
                    </div>
                    <button type="submit" className="w-full bg-white text-black font-bold py-2 rounded-lg hover:bg-neutral-200 transition-colors">
                        Login
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Word of The Day Admin</h1>
                        <p className="text-white">Manage your daily entrepreneurship words</p>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={handleLogout} className="px-4 py-2 text-sm text-white hover:text-white transition-colors">
                            Logout
                        </button>
                        <button
                            onClick={handleAddNewClick}
                            className="flex items-center gap-2 bg-neutral-800 text-white px-6 py-2 rounded-lg font-bold hover:bg-neutral-700 transition-colors border border-neutral-700"
                        >
                            <Plus className="w-4 h-4" /> Add New Word
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* List Section */}
                    <div className={cn("col-span-1 lg:col-span-3", isEditing ? "lg:col-span-1" : "lg:col-span-3")}>
                        <div className="bg-neutral-900 border border-neutral-600 rounded-xl overflow-hidden">
                            <div className="p-4 border-b border-neutral-600 bg-neutral-900/50 backdrop-blur-sm">
                                <h2 className="font-semibold text-neutral-200">Scheduled Words</h2>
                            </div>
                            <div className="divide-y divide-neutral-800 max-h-[600px] overflow-y-auto">
                                {words.length === 0 ? (
                                    <div className="p-8 text-center text-white">No words added yet. Start by adding one!</div>
                                ) : (
                                    words.slice().reverse().map((word) => (
                                        <div key={word._id} className="p-4 flex items-center justify-between hover:bg-neutral-800/50 transition-colors group">
                                            <div className="flex-1 min-w-0 mr-4">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-bold text-white truncate">{word.title}</h3>
                                                    <span className="text-xs px-2 py-0.5 bg-white/10 rounded-full text-neutral-300">{word.category}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-white text-xs">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>{word.date}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEditClick(word)} className="p-2 text-white hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDeleteClick(word._id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Editor Section */}
                    <AnimatePresence>
                        {isEditing && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="col-span-1 lg:col-span-2"
                            >
                                <div className="bg-neutral-900 border border-neutral-600 rounded-xl p-6 sticky top-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-bold">{currentWord ? 'Edit Word' : 'New Word'}</h2>
                                        <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-white uppercase mb-2">Word Title</label>
                                                <input
                                                    type="text"
                                                    name="title"
                                                    value={formData.title}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full bg-black border border-neutral-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                                                    placeholder="e.g. Bootstrapping"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-white uppercase mb-2">Publish Date</label>
                                                <input
                                                    type="date"
                                                    name="date"
                                                    value={formData.date}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full bg-black border border-neutral-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-white uppercase mb-2">Category</label>
                                            <select
                                                name="category"
                                                value={formData.category}
                                                onChange={handleChange}
                                                className="w-full bg-black border border-neutral-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all appearance-none"
                                            >
                                                <option value="Entrepreneurship">Entrepreneurship</option>
                                                <option value="Startup">Startup</option>
                                                <option value="Business">Business</option>
                                                <option value="Innovation">Innovation</option>
                                                <option value="Marketing">Marketing</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-white uppercase mb-2">Image URL or Upload</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="url"
                                                    name="imageUrl"
                                                    value={formData.imageUrl}
                                                    onChange={handleChange}
                                                    className="w-full bg-black border border-neutral-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                                                    placeholder="https://..."
                                                />
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    onChange={handleImageUpload}
                                                    accept="image/*"
                                                    className="hidden"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={triggerFileInput}
                                                    className="w-12 h-12 bg-neutral-800 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden border border-neutral-700 hover:bg-neutral-700 transition-colors"
                                                    title="Upload Image"
                                                >
                                                    {formData.imageUrl ? (
                                                        <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <ImageIcon className="w-5 h-5 text-white" />
                                                    )}
                                                </button>
                                            </div>
                                            <p className="text-[10px] text-white mt-1">Use a direct image link or click the icon to upload from device.</p>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-white uppercase mb-2">Short Definition</label>
                                            <textarea
                                                name="definition"
                                                value={formData.definition}
                                                onChange={handleChange}
                                                required
                                                rows="2"
                                                className="w-full bg-black border border-neutral-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all resize-none"
                                                placeholder="A concise, 1-sentence definition..."
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-white uppercase mb-2">Detailed Explanation</label>
                                            <textarea
                                                name="explanation"
                                                value={formData.explanation}
                                                onChange={handleChange}
                                                required
                                                rows="6"
                                                className="w-full bg-black border border-neutral-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                                                placeholder="Expand on the concept using student-friendly language..."
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-white uppercase mb-2">Example Scenario / Usage</label>
                                            <textarea
                                                name="example"
                                                value={formData.example}
                                                onChange={handleChange}
                                                rows="4"
                                                className="w-full bg-black border border-neutral-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                                                placeholder="Real-world example (optional)..."
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-white uppercase mb-2">Read More URL (Optional)</label>
                                            <input
                                                type="url"
                                                name="readMoreUrl"
                                                value={formData.readMoreUrl}
                                                onChange={handleChange}
                                                className="w-full bg-black border border-neutral-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                                                placeholder="Link to article or resource..."
                                            />
                                        </div>

                                        <div className="pt-4 flex justify-end gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setIsEditing(false)}
                                                className="px-6 py-2.5 rounded-lg text-sm font-bold text-white hover:text-white hover:bg-neutral-800 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-6 py-2.5 rounded-lg bg-neutral-800 text-white text-sm font-bold hover:bg-neutral-700 transition-colors flex items-center gap-2 border border-neutral-700"
                                            >
                                                <Save className="w-4 h-4" />
                                                {currentWord ? 'Update Word' : 'Publish Word'}
                                            </button>
                                        </div>

                                    </form>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
