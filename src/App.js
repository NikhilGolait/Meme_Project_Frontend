import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import axios from 'axios';
import './App.css';

// ============ API CONFIGURATION ============
const API_URL = 'https://meme-project-backend.onrender.com/api';
const IMAGE_BASE_URL = 'https://meme-project-backend.onrender.com';
axios.defaults.withCredentials = true;

// ============ AUTH CONTEXT ============
const AuthContext = createContext();

const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await axios.get(`${API_URL}/me`);
            setUser(response.data);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const register = async (username, email, password) => {
        const response = await axios.post(`${API_URL}/register`, { username, email, password });
        setUser(response.data.user);
        return response.data;
    };

    const login = async (email, password) => {
        const response = await axios.post(`${API_URL}/login`, { email, password });
        setUser(response.data.user);
        return response.data;
    };

    const guestLogin = async () => {
        const response = await axios.post(`${API_URL}/guest-login`);
        setUser(response.data.user);
        return response.data;
    };

    const logout = async () => {
        await axios.post(`${API_URL}/logout`);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, register, login, guestLogin, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

// ============ NAVBAR COMPONENT ============
const Navbar = () => {
    const { user, logout } = useAuth();
    const [currentPage, setCurrentPage] = useState('home');

    if (!user) return null;

    const navigate = (page) => {
        setCurrentPage(page);
        window.dispatchEvent(new CustomEvent('pageChange', { detail: page }));
    };

    return (
        <nav className="navbar">
            <div className="nav-container">
                <div className="nav-logo" onClick={() => navigate('home')}>🎨 Meme Maker</div>
                <div className="nav-menu">
                    <button className="nav-link" onClick={() => navigate('home')}>Home</button>
                    <button className="nav-link" onClick={() => navigate('create')}>Create Meme</button>
                    <button className="nav-link" onClick={() => navigate('profile')}>
                        👤 {user.username}{user.isGuest && ' (Guest)'}
                    </button>
                    <button className="nav-link btn-link" onClick={logout}>Logout</button>
                </div>
            </div>
        </nav>
    );
};

// ============ LOGIN PAGE ============
const LoginPage = ({ onNavigate }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, guestLogin } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            onNavigate('home');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    const handleGuestLogin = async () => {
        await guestLogin();
        onNavigate('home');
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h1 className="app-title">🎨 Meme Maker</h1>
                <h2>Welcome Back!</h2>
                <p className="subtitle">Create and share amazing memes</p>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <button type="submit" className="btn-primary">Login</button>
                </form>
                <button className="btn-secondary" onClick={handleGuestLogin}>Continue as Guest</button>
                <p className="auth-link">
                    Don't have an account? <button className="link-btn" onClick={() => onNavigate('register')}>Sign up</button>
                </p>
            </div>
        </div>
    );
};

// ============ REGISTER PAGE ============
const RegisterPage = ({ onNavigate }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(username, email, password);
            onNavigate('home');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h1 className="app-title">🎨 Meme Maker</h1>
                <h2>Create Account</h2>
                <p className="subtitle">Join the meme community</p>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <input type="password" placeholder="Password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <button type="submit" className="btn-primary">Sign Up</button>
                </form>
                <p className="auth-link">
                    Already have an account? <button className="link-btn" onClick={() => onNavigate('login')}>Login</button>
                </p>
            </div>
        </div>
    );
};

// ============ HOME PAGE ============
const HomePage = ({ onNavigate }) => {
    const [trending, setTrending] = useState([]);

    useEffect(() => {
        fetchTrending();
    }, []);

    const fetchTrending = async () => {
        try {
            const response = await axios.get(`${API_URL}/trending`);
            setTrending(response.data);
        } catch (error) {
            console.error('Error fetching trending:', error);
        }
    };

    return (
        <div className="home-container">
            <div className="hero-section">
                <h1>Create Amazing Memes</h1>
                <p>Upload images, add text, and share with friends</p>
                <button className="btn-create" onClick={() => onNavigate('create')}>Start Creating</button>
            </div>
            
            <div className="features-section">
                <h2>Features</h2>
                <div className="features-grid">
                    <div className="feature-card">🎨 Upload Images</div>
                    <div className="feature-card">✏️ Add Text & Stickers</div>
                    <div className="feature-card">🤖 AI Captions</div>
                    <div className="feature-card">📥 Download & Share</div>
                </div>
            </div>

            {trending.length > 0 && (
                <div className="trending-section">
                    <h2>🔥 Trending Memes</h2>
                    <div className="memes-grid">
                        {trending.map(meme => (
                            <div key={meme._id} className="meme-card">
                                <img src={`${IMAGE_BASE_URL}${meme.imageUrl}`} alt="meme" />
                                <div className="meme-info">
                                    <span>❤️ {meme.likes}</span>
                                    <span>👁️ {meme.views}</span>
                                    <span>by {meme.userId?.username || 'Unknown'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ============ CREATE MEME PAGE (with Text Color Picker) ============
const CreateMemePage = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [templates, setTemplates] = useState([]);
    const [texts, setTexts] = useState([]);
    const [currentText, setCurrentText] = useState('');
    const [textColor, setTextColor] = useState('#FFFFFF');
    const [textSize, setTextSize] = useState(30);
    const [showAICaptions, setShowAICaptions] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState([]);
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchTemplates();
    }, []);

    useEffect(() => {
        if (selectedImage) {
            drawImage();
        }
    }, [selectedImage, texts]);

    const fetchTemplates = async () => {
        try {
            const response = await axios.get(`${API_URL}/templates`);
            setTemplates(response.data);
        } catch (error) {
            console.error('Error fetching templates:', error);
        }
    };

    const drawImage = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.src = selectedImage;
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            texts.forEach(text => {
                ctx.font = `${text.fontSize || 30}px Arial`;
                ctx.fillStyle = text.color || '#FFFFFF';
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 2;
                ctx.textAlign = 'center';
                ctx.strokeText(text.content, text.x || canvas.width/2, text.y || 50);
                ctx.fillText(text.content, text.x || canvas.width/2, text.y || 50);
            });
        };
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => setSelectedImage(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleTemplateSelect = (template) => {
        setSelectedImage(template.url);
    };

    const addText = () => {
        if (currentText.trim()) {
            setTexts([...texts, {
                content: currentText,
                x: 250,
                y: 50 + (texts.length * 40),
                fontSize: textSize,
                color: textColor
            }]);
            setCurrentText('');
        }
    };

    const generateAICaptions = async () => {
        try {
            const response = await axios.post(`${API_URL}/ai-caption`);
            setAiSuggestions(response.data.suggestions);
            setShowAICaptions(true);
        } catch (error) {
            console.error('Error generating AI captions:', error);
        }
    };

    const addAICaption = (caption) => {
        setTexts([...texts, {
            content: caption,
            x: 250,
            y: 50 + (texts.length * 40),
            fontSize: textSize,
            color: textColor
        }]);
        setShowAICaptions(false);
    };

    const downloadMeme = () => {
        const canvas = canvasRef.current;
        const link = document.createElement('a');
        link.download = 'meme.png';
        link.href = canvas.toDataURL();
        link.click();
    };

    const saveToGallery = async () => {
        const canvas = canvasRef.current;
        const dataUrl = canvas.toDataURL();
        
        const blob = await (await fetch(dataUrl)).blob();
        const formData = new FormData();
        formData.append('image', blob, 'meme.png');

        try {
            const uploadRes = await axios.post(`${API_URL}/upload`, formData);
            const imageUrl = uploadRes.data.url;

            await axios.post(`${API_URL}/memes`, {
                imageUrl,
                title: 'My Meme',
                texts: texts
            });
            alert('✅ Meme saved to gallery!');
        } catch (error) {
            console.error('Save error:', error);
            alert('Please login to save memes');
        }
    };

    const updateTextColor = (color) => {
        setTextColor(color);
        if (texts.length > 0 && window.lastSelectedTextIndex !== undefined) {
            const updatedTexts = [...texts];
            updatedTexts[window.lastSelectedTextIndex] = {
                ...updatedTexts[window.lastSelectedTextIndex],
                color: color
            };
            setTexts(updatedTexts);
        }
    };

    const updateTextSize = (size) => {
        setTextSize(size);
        if (texts.length > 0 && window.lastSelectedTextIndex !== undefined) {
            const updatedTexts = [...texts];
            updatedTexts[window.lastSelectedTextIndex] = {
                ...updatedTexts[window.lastSelectedTextIndex],
                fontSize: size
            };
            setTexts(updatedTexts);
        }
    };

    const selectTextForEdit = (index) => {
        window.lastSelectedTextIndex = index;
        const selectedText = texts[index];
        setCurrentText(selectedText.content);
        setTextColor(selectedText.color || '#FFFFFF');
        setTextSize(selectedText.fontSize || 30);
        const updatedTexts = texts.filter((_, i) => i !== index);
        setTexts(updatedTexts);
    };

    const deleteText = (index) => {
        const updatedTexts = texts.filter((_, i) => i !== index);
        setTexts(updatedTexts);
    };

    return (
        <div className="create-meme-container">
            <div className="meme-editor">
                <div className="editor-sidebar">
                    <h3>Create Your Meme</h3>
                    
                    <div className="upload-section">
                        <h4>📸 Upload Image</h4>
                        <input type="file" accept="image/*" onChange={handleImageUpload} ref={fileInputRef} style={{display: 'none'}} />
                        <button onClick={() => fileInputRef.current.click()}>Choose File</button>
                    </div>

                    <div className="templates-section">
                        <h4>🎨 Template Gallery</h4>
                        <div className="templates-grid">
                            {templates.map(template => (
                                <img key={template.id} src={template.url} alt={template.name}
                                    onClick={() => handleTemplateSelect(template)} className="template-thumbnail" />
                            ))}
                        </div>
                    </div>

                    <div className="text-section">
                        <h4>✏️ Add Text</h4>
                        <input 
                            type="text" 
                            value={currentText} 
                            onChange={(e) => setCurrentText(e.target.value)} 
                            placeholder="Enter text" 
                        />
                        
                        <div className="color-picker-section">
                            <label>🎨 Text Color:</label>
                            <div className="color-preview" style={{ backgroundColor: textColor }}></div>
                            <input 
                                type="color" 
                                value={textColor} 
                                onChange={(e) => updateTextColor(e.target.value)}
                                className="color-input"
                            />
                        </div>

                        <div className="color-presets">
                            <div className="color-preset" style={{ backgroundColor: '#FFFFFF' }} onClick={() => updateTextColor('#FFFFFF')} title="White"></div>
                            <div className="color-preset" style={{ backgroundColor: '#000000' }} onClick={() => updateTextColor('#000000')} title="Black"></div>
                            <div className="color-preset" style={{ backgroundColor: '#FF0000' }} onClick={() => updateTextColor('#FF0000')} title="Red"></div>
                            <div className="color-preset" style={{ backgroundColor: '#00FF00' }} onClick={() => updateTextColor('#00FF00')} title="Green"></div>
                            <div className="color-preset" style={{ backgroundColor: '#0000FF' }} onClick={() => updateTextColor('#0000FF')} title="Blue"></div>
                            <div className="color-preset" style={{ backgroundColor: '#FFFF00' }} onClick={() => updateTextColor('#FFFF00')} title="Yellow"></div>
                            <div className="color-preset" style={{ backgroundColor: '#FF00FF' }} onClick={() => updateTextColor('#FF00FF')} title="Magenta"></div>
                            <div className="color-preset" style={{ backgroundColor: '#00FFFF' }} onClick={() => updateTextColor('#00FFFF')} title="Cyan"></div>
                            <div className="color-preset" style={{ backgroundColor: '#FFA500' }} onClick={() => updateTextColor('#FFA500')} title="Orange"></div>
                            <div className="color-preset" style={{ backgroundColor: '#800080' }} onClick={() => updateTextColor('#800080')} title="Purple"></div>
                        </div>

                        <div className="font-size-section">
                            <label>📏 Text Size: {textSize}px</label>
                            <input 
                                type="range" 
                                min="10" 
                                max="100" 
                                value={textSize} 
                                onChange={(e) => updateTextSize(parseInt(e.target.value))}
                                className="size-slider"
                            />
                        </div>

                        <button onClick={addText}>Add Text</button>
                        <button onClick={generateAICaptions} className="btn-ai">🤖 AI Caption</button>
                        
                        {showAICaptions && (
                            <div className="ai-suggestions">
                                <h4>AI Suggestions:</h4>
                                {aiSuggestions.map((suggestion, idx) => (
                                    <div key={idx} className="suggestion-item" onClick={() => addAICaption(suggestion)}>
                                        {suggestion}
                                    </div>
                                ))}
                            </div>
                        )}

                        {texts.length > 0 && (
                            <div className="texts-list">
                                <h4>Added Texts:</h4>
                                {texts.map((text, idx) => (
                                    <div key={idx} className="text-item">
                                        <div className="text-preview" style={{ color: text.color }}>
                                            {text.content}
                                        </div>
                                        <div className="text-actions">
                                            <button onClick={() => selectTextForEdit(idx)} className="edit-text-btn">✏️</button>
                                            <button onClick={() => deleteText(idx)} className="delete-text-btn">🗑️</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="action-buttons">
                        <button onClick={downloadMeme} className="btn-download">📥 Download</button>
                        <button onClick={saveToGallery} className="btn-save">💾 Save to Gallery</button>
                    </div>
                </div>

                <div className="editor-canvas">
                    {selectedImage ? (
                        <canvas ref={canvasRef} style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }} />
                    ) : (
                        <div className="no-image">Select an image to start creating your meme</div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ============ PROFILE PAGE ============
const ProfilePage = () => {
    const { user } = useAuth();
    const [myMemes, setMyMemes] = useState([]);

    useEffect(() => {
        if (user && !user.isGuest) {
            fetchMyMemes();
        }
    }, [user]);

    const fetchMyMemes = async () => {
        try {
            const response = await axios.get(`${API_URL}/my-memes`);
            setMyMemes(response.data);
        } catch (error) {
            console.error('Error fetching memes:', error);
        }
    };

    if (!user) return null;

    return (
        <div className="profile-container">
            <div className="profile-header">
                <div className="profile-avatar">
                    {user.username?.charAt(0).toUpperCase()}
                </div>
                <div className="profile-info">
                    <h2>{user.username}</h2>
                    {user.email && <p>{user.email}</p>}
                    {user.isGuest && <p className="guest-badge">Guest User</p>}
                </div>
            </div>

            <div className="gallery-section">
                <h3>📸 My Meme Gallery</h3>
                {myMemes.length === 0 ? (
                    <p className="no-memes">You haven't created any memes yet. <button className="link-btn" onClick={() => window.dispatchEvent(new CustomEvent('pageChange', { detail: 'create' }))}>Create one now!</button></p>
                ) : (
                    <div className="memes-grid">
                        {myMemes.map(meme => (
                            <div key={meme._id} className="meme-card">
                                <img src={`${IMAGE_BASE_URL}${meme.imageUrl}`} alt="meme" />
                                <div className="meme-date">{new Date(meme.createdAt).toLocaleDateString()}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// ============ MAIN APP ============
function App() {
    const [currentPage, setCurrentPage] = useState('login');
    const { user, loading } = useAuth();

    useEffect(() => {
        const handlePageChange = (e) => {
            setCurrentPage(e.detail);
        };
        window.addEventListener('pageChange', handlePageChange);
        return () => window.removeEventListener('pageChange', handlePageChange);
    }, []);

    useEffect(() => {
        if (user && currentPage === 'login') {
            setCurrentPage('home');
        } else if (!user && (currentPage === 'home' || currentPage === 'create' || currentPage === 'profile')) {
            setCurrentPage('login');
        }
    }, [user, currentPage]);

    const navigate = (page) => {
        setCurrentPage(page);
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="app">
            <Navbar />
            {currentPage === 'login' && <LoginPage onNavigate={navigate} />}
            {currentPage === 'register' && <RegisterPage onNavigate={navigate} />}
            {currentPage === 'home' && <HomePage onNavigate={navigate} />}
            {currentPage === 'create' && <CreateMemePage />}
            {currentPage === 'profile' && <ProfilePage />}
        </div>
    );
}

// ============ WRAPPER ============
export default function AppWrapper() {
    return (
        <AuthProvider>
            <App />
        </AuthProvider>
    );
}