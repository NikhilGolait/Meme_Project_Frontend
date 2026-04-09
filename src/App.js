import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:5000/api';
axios.defaults.withCredentials = true;

// ============ AUTH CONTEXT ============
const AuthContext = createContext();
const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { checkAuth(); }, []);

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

// ============ NAVBAR ============
const Navbar = () => {
    const { user, logout } = useAuth();
    if (!user) return null;
    const navigate = (page) => window.dispatchEvent(new CustomEvent('pageChange', { detail: page }));
    return (
        <nav className="navbar">
            <div className="nav-container">
                <div className="nav-logo" onClick={() => navigate('home')}>🎨 Meme Maker</div>
                <div className="nav-menu">
                    <button className="nav-link" onClick={() => navigate('home')}>Home</button>
                    <button className="nav-link" onClick={() => navigate('create')}>Create Meme</button>
                    <button className="nav-link" onClick={() => navigate('create-gif')}>Create GIF Meme</button>
                    <button className="nav-link" onClick={() => navigate('profile')}>👤 {user.username}{user.isGuest && ' (Guest)'}</button>
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
                <p className="auth-link">Don't have an account? <button className="link-btn" onClick={() => onNavigate('register')}>Sign up</button></p>
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
                <p className="auth-link">Already have an account? <button className="link-btn" onClick={() => onNavigate('login')}>Login</button></p>
            </div>
        </div>
    );
};

// ============ HOME PAGE ============
const HomePage = ({ onNavigate }) => {
    const [trending, setTrending] = useState([]);
    useEffect(() => { fetchTrending(); }, []);

    const fetchTrending = async () => {
        try {
            const response = await axios.get(`${API_URL}/trending`);
            setTrending(response.data);
        } catch (error) { console.error(error); }
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
                    <div className="feature-card">✏️ Add Text</div>
                    <div className="feature-card">🤖 AI Captions</div>
                    <div className="feature-card">🎬 GIF Memes</div>
                    <div className="feature-card">📥 Download & Share</div>
                </div>
            </div>
            {trending.length > 0 && (
                <div className="trending-section">
                    <h2>🔥 Trending Memes</h2>
                    <div className="memes-grid">
                        {trending.map(meme => (
                            <div key={meme._id} className="meme-card">
                                <img src={`http://localhost:5000${meme.imageUrl}`} alt="meme" />
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

// ============ CREATE MEME PAGE (Images with Draggable Text) ============
const CreateMemePage = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [templates, setTemplates] = useState([]);
    const [showTemplateUpload, setShowTemplateUpload] = useState(false);
    const [templateName, setTemplateName] = useState('');
    const [templateFile, setTemplateFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [texts, setTexts] = useState([]);
    const [currentText, setCurrentText] = useState('');
    const [textColor, setTextColor] = useState('#FFFFFF');
    const [textSize, setTextSize] = useState(30);
    const [showAICaptions, setShowAICaptions] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState([]);
    const [loadingAI, setLoadingAI] = useState(false);
    const [draggingTextIndex, setDraggingTextIndex] = useState(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);
    const templateFileInputRef = useRef(null);
    const { user } = useAuth();

    useEffect(() => {
        if (user && !user.isGuest) fetchTemplates();
    }, [user]);

    useEffect(() => {
        if (selectedImage) drawImage();
    }, [selectedImage, texts]);

    const fetchTemplates = async () => {
        try {
            const response = await axios.get(`${API_URL}/templates`);
            setTemplates(response.data);
        } catch (error) { console.error(error); }
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
                ctx.strokeText(text.content, text.x, text.y);
                ctx.fillText(text.content, text.x, text.y);
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

    const handleTemplateFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setTemplateFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('template-preview').src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadTemplate = async () => {
        if (!templateFile) return alert('Please select an image file');
        setUploading(true);
        const formData = new FormData();
        formData.append('image', templateFile);
        formData.append('name', templateName || 'My Template');
        try {
            await axios.post(`${API_URL}/templates/upload`, formData);
            alert('✅ Template uploaded!');
            setShowTemplateUpload(false);
            setTemplateName('');
            setTemplateFile(null);
            fetchTemplates();
        } catch (error) {
            alert('Upload failed. Please login.');
        } finally {
            setUploading(false);
        }
    };

    const deleteTemplate = async (templateId) => {
        if (window.confirm('Delete this template?')) {
            try {
                await axios.delete(`${API_URL}/templates/${templateId}`);
                alert('✅ Template deleted');
                fetchTemplates();
            } catch (error) {
                alert('Delete failed');
            }
        }
    };

    const getMousePosition = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        let clientX, clientY;
        if (e.touches) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        const canvasX = (clientX - rect.left) * scaleX;
        const canvasY = (clientY - rect.top) * scaleY;
        
        return { x: Math.max(0, Math.min(canvas.width, canvasX)), y: Math.max(0, Math.min(canvas.height, canvasY)) };
    };

    const findTextIndexAtPosition = (x, y) => {
        for (let i = texts.length - 1; i >= 0; i--) {
            const text = texts[i];
            const ctx = canvasRef.current.getContext('2d');
            ctx.font = `${text.fontSize}px Arial`;
            const metrics = ctx.measureText(text.content);
            const textWidth = metrics.width;
            const textHeight = text.fontSize;
            
            if (x >= text.x - textWidth/2 && x <= text.x + textWidth/2 &&
                y >= text.y - textHeight/2 && y <= text.y + textHeight/2) {
                return i;
            }
        }
        return -1;
    };

    const handleMouseDown = (e) => {
        e.preventDefault();
        const { x, y } = getMousePosition(e);
        const textIndex = findTextIndexAtPosition(x, y);
        
        if (textIndex !== -1) {
            setDraggingTextIndex(textIndex);
            setDragOffset({ x: x - texts[textIndex].x, y: y - texts[textIndex].y });
        }
    };

    const handleMouseMove = (e) => {
        if (draggingTextIndex === null) return;
        e.preventDefault();
        
        const { x, y } = getMousePosition(e);
        const newX = x - dragOffset.x;
        const newY = y - dragOffset.y;
        
        const updatedTexts = [...texts];
        updatedTexts[draggingTextIndex] = {
            ...updatedTexts[draggingTextIndex],
            x: newX,
            y: newY
        };
        setTexts(updatedTexts);
    };

    const handleMouseUp = () => {
        setDraggingTextIndex(null);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        canvas.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('touchstart', handleMouseDown);
        window.addEventListener('touchmove', handleMouseMove);
        window.addEventListener('touchend', handleMouseUp);
        
        return () => {
            canvas.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('touchstart', handleMouseDown);
            window.removeEventListener('touchmove', handleMouseMove);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, [texts, draggingTextIndex, dragOffset]);

    const generateAICaptions = async () => {
        if (!selectedImage) {
            alert('Please select an image first');
            return;
        }
        
        setLoadingAI(true);
        setShowAICaptions(false);
        
        try {
            const base64Data = selectedImage.split(',')[1];
            const response = await axios.post(`${API_URL}/ai-caption-vision`, {
                imageBase64: base64Data,
                mediaType: 'image'
            });
            setAiSuggestions(response.data.suggestions);
            setShowAICaptions(true);
        } catch (error) {
            console.error('AI caption error:', error);
            alert('Failed to generate AI captions');
        } finally {
            setLoadingAI(false);
        }
    };

    const addText = () => {
        if (currentText.trim()) {
            const canvas = canvasRef.current;
            const centerX = canvas ? canvas.width / 2 : 250;
            const centerY = canvas ? canvas.height / 2 : 250;
            
            setTexts([...texts, {
                content: currentText,
                x: centerX,
                y: centerY,
                fontSize: textSize,
                color: textColor
            }]);
            setCurrentText('');
        }
    };

    const addAICaption = (caption) => {
        const canvas = canvasRef.current;
        const centerX = canvas ? canvas.width / 2 : 250;
        const centerY = canvas ? canvas.height / 2 : 250;
        
        setTexts([...texts, {
            content: caption,
            x: centerX,
            y: centerY,
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
            await axios.post(`${API_URL}/memes`, {
                imageUrl: uploadRes.data.url,
                title: 'My Meme',
                texts: texts
            });
            alert('✅ Meme saved to gallery!');
        } catch (error) {
            alert('Please login to save memes');
        }
    };

    const updateTextColor = (color) => {
        setTextColor(color);
        if (texts.length > 0 && window.lastSelectedTextIndex !== undefined) {
            const updatedTexts = [...texts];
            updatedTexts[window.lastSelectedTextIndex] = { ...updatedTexts[window.lastSelectedTextIndex], color };
            setTexts(updatedTexts);
        }
    };

    const updateTextSize = (size) => {
        setTextSize(size);
        if (texts.length > 0 && window.lastSelectedTextIndex !== undefined) {
            const updatedTexts = [...texts];
            updatedTexts[window.lastSelectedTextIndex] = { ...updatedTexts[window.lastSelectedTextIndex], fontSize: size };
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
        setTexts(texts.filter((_, i) => i !== index));
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
                        <div className="templates-header">
                            <h4>🎨 My Template Gallery</h4>
                            {user && !user.isGuest && (
                                <button className="btn-add-template" onClick={() => setShowTemplateUpload(!showTemplateUpload)}>
                                    {showTemplateUpload ? '✖ Cancel' : '+ Add Template'}
                                </button>
                            )}
                        </div>

                        {showTemplateUpload && (
                            <div className="template-upload-form">
                                <h5>Upload Custom Template</h5>
                                <input type="text" placeholder="Template name (optional)" value={templateName} onChange={(e) => setTemplateName(e.target.value)} />
                                <input type="file" accept="image/*" onChange={handleTemplateFileSelect} ref={templateFileInputRef} />
                                {templateFile && (
                                    <div className="template-preview-container">
                                        <img id="template-preview" alt="Preview" className="template-preview-img" />
                                        <button onClick={uploadTemplate} disabled={uploading}>{uploading ? 'Uploading...' : 'Upload Template'}</button>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="templates-grid">
                            {templates.length === 0 ? (
                                <p className="no-templates">No templates yet. Click "+ Add Template" to upload your own images!</p>
                            ) : (
                                templates.map(template => (
                                    <div key={template.id} className="template-item">
                                        <img src={template.url} alt={template.name} onClick={() => handleTemplateSelect(template)} className="template-thumbnail" />
                                        <div className="template-info">
                                            <span>{template.name}</span>
                                            <button className="delete-template-btn" onClick={() => deleteTemplate(template.id)}>🗑️</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="text-section">
                        <h4>✏️ Add Text</h4>
                        <p className="instruction-text">💡 Tip: Click and drag text on the image to reposition it!</p>
                        <input type="text" value={currentText} onChange={(e) => setCurrentText(e.target.value)} placeholder="Enter text" />
                        
                        <div className="color-picker-section">
                            <label>🎨 Text Color:</label>
                            <div className="color-preview" style={{ backgroundColor: textColor }}></div>
                            <input type="color" value={textColor} onChange={(e) => updateTextColor(e.target.value)} className="color-input" />
                        </div>

                        <div className="color-presets">
                            {['#FFFFFF','#000000','#FF0000','#00FF00','#0000FF','#FFFF00','#FF00FF','#00FFFF','#FFA500','#800080'].map(c => (
                                <div key={c} className="color-preset" style={{ backgroundColor: c }} onClick={() => updateTextColor(c)} title={c}></div>
                            ))}
                        </div>

                        <div className="font-size-section">
                            <label>📏 Text Size: {textSize}px</label>
                            <input type="range" min="10" max="100" value={textSize} onChange={(e) => updateTextSize(parseInt(e.target.value))} className="size-slider" />
                        </div>

                        <button onClick={addText}>Add Text</button>
                        <button onClick={generateAICaptions} className="btn-ai" disabled={loadingAI}>
                            {loadingAI ? '🤖 Analyzing with AI...' : '🤖 AI Caption'}
                        </button>
                        
                        {showAICaptions && (
                            <div className="ai-suggestions">
                                <h4>✨ AI-Generated Captions:</h4>
                                {aiSuggestions.map((s, idx) => (
                                    <div key={idx} className="suggestion-item" onClick={() => addAICaption(s)}>
                                        {s}
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
                                            {text.content} (Position: {Math.round(text.x)}, {Math.round(text.y)})
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
                        <canvas 
                            ref={canvasRef} 
                            style={{ 
                                maxWidth: '100%', 
                                height: 'auto', 
                                borderRadius: '8px',
                                cursor: draggingTextIndex !== null ? 'grabbing' : 'grab'
                            }} 
                        />
                    ) : (
                        <div className="no-image">Select an image to start creating your meme</div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ============ CREATE GIF MEME PAGE (with Draggable Text) ============
const CreateGifMemePage = () => {
    const [selectedGif, setSelectedGif] = useState(null);
    const [texts, setTexts] = useState([]);
    const [currentText, setCurrentText] = useState('');
    const [textColor, setTextColor] = useState('#FFFFFF');
    const [textSize, setTextSize] = useState(30);
    const [showAICaptions, setShowAICaptions] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState([]);
    const [loadingAI, setLoadingAI] = useState(false);
    const [draggingTextIndex, setDraggingTextIndex] = useState(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [gifDimensions, setGifDimensions] = useState({ width: 0, height: 0 });
    const containerRef = useRef(null);
    const fileInputRef = useRef(null);
    const { user } = useAuth();

    const handleGifUpload = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'image/gif') {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    setGifDimensions({ width: img.width, height: img.height });
                    setSelectedGif(e.target.result);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        } else {
            alert('Please upload a valid GIF file');
        }
    };

    const getMousePosition = (e) => {
        const container = containerRef.current;
        if (!container) return { x: 0, y: 0 };
        
        const rect = container.getBoundingClientRect();
        const scaleX = gifDimensions.width / rect.width;
        const scaleY = gifDimensions.height / rect.height;
        
        let clientX, clientY;
        if (e.touches) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        const containerX = (clientX - rect.left) * scaleX;
        const containerY = (clientY - rect.top) * scaleY;
        
        return { x: Math.max(0, Math.min(gifDimensions.width, containerX)), y: Math.max(0, Math.min(gifDimensions.height, containerY)) };
    };

    const findTextIndexAtPosition = (x, y) => {
        for (let i = texts.length - 1; i >= 0; i--) {
            const text = texts[i];
            const textWidth = text.content.length * (text.fontSize * 0.6);
            const textHeight = text.fontSize;
            
            if (x >= text.x - textWidth/2 && x <= text.x + textWidth/2 &&
                y >= text.y - textHeight/2 && y <= text.y + textHeight/2) {
                return i;
            }
        }
        return -1;
    };

    const handleMouseDown = (e) => {
        e.preventDefault();
        const { x, y } = getMousePosition(e);
        const textIndex = findTextIndexAtPosition(x, y);
        
        if (textIndex !== -1) {
            setDraggingTextIndex(textIndex);
            setDragOffset({ x: x - texts[textIndex].x, y: y - texts[textIndex].y });
        }
    };

    const handleMouseMove = (e) => {
        if (draggingTextIndex === null) return;
        e.preventDefault();
        
        const { x, y } = getMousePosition(e);
        const newX = x - dragOffset.x;
        const newY = y - dragOffset.y;
        
        const updatedTexts = [...texts];
        updatedTexts[draggingTextIndex] = {
            ...updatedTexts[draggingTextIndex],
            x: Math.max(0, Math.min(gifDimensions.width, newX)),
            y: Math.max(0, Math.min(gifDimensions.height, newY))
        };
        setTexts(updatedTexts);
    };

    const handleMouseUp = () => {
        setDraggingTextIndex(null);
    };

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        
        container.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        container.addEventListener('touchstart', handleMouseDown);
        window.addEventListener('touchmove', handleMouseMove);
        window.addEventListener('touchend', handleMouseUp);
        
        return () => {
            container.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            container.removeEventListener('touchstart', handleMouseDown);
            window.removeEventListener('touchmove', handleMouseMove);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, [texts, draggingTextIndex, dragOffset, gifDimensions]);

    const captureGifFrame = (gifUrl) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = gifUrl;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                canvas.getContext('2d').drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/jpeg'));
            };
        });
    };

    const generateAICaptions = async () => {
        if (!selectedGif) {
            alert('Please select a GIF first');
            return;
        }
        
        setLoadingAI(true);
        setShowAICaptions(false);
        
        try {
            const firstFrame = await captureGifFrame(selectedGif);
            const base64Data = firstFrame.split(',')[1];
            const response = await axios.post(`${API_URL}/ai-caption-vision`, {
                imageBase64: base64Data,
                mediaType: 'gif'
            });
            setAiSuggestions(response.data.suggestions);
            setShowAICaptions(true);
        } catch (error) {
            console.error('AI caption error:', error);
            alert('Failed to generate AI captions');
        } finally {
            setLoadingAI(false);
        }
    };

    const addText = () => {
        if (currentText.trim()) {
            setTexts([...texts, {
                content: currentText,
                x: gifDimensions.width / 2,
                y: gifDimensions.height / 2,
                fontSize: textSize,
                color: textColor
            }]);
            setCurrentText('');
        }
    };

    const addAICaption = (caption) => {
        setTexts([...texts, {
            content: caption,
            x: gifDimensions.width / 2,
            y: gifDimensions.height / 2,
            fontSize: textSize,
            color: textColor
        }]);
        setShowAICaptions(false);
    };

    const downloadGifMeme = () => {
        alert('GIF download with text overlay requires advanced processing. The GIF will be saved without text for now.');
        const link = document.createElement('a');
        link.download = 'gif-meme.gif';
        link.href = selectedGif;
        link.click();
    };

    const saveGifToGallery = async () => {
        if (!selectedGif) {
            alert('Please select a GIF first');
            return;
        }

        const response = await fetch(selectedGif);
        const blob = await response.blob();
        const formData = new FormData();
        formData.append('gif', blob, 'gif-meme.gif');

        try {
            const uploadRes = await axios.post(`${API_URL}/upload-gif`, formData);
            const gifUrl = uploadRes.data.url;

            await axios.post(`${API_URL}/gif-memes`, {
                gifUrl: gifUrl,
                title: 'My GIF Meme',
                texts: texts
            });
            alert('✅ GIF Meme saved to gallery!');
        } catch (error) {
            console.error('Save error:', error);
            alert('Please login to save GIF memes');
        }
    };

    const updateTextColor = (color) => {
        setTextColor(color);
        if (texts.length > 0 && window.lastSelectedTextIndex !== undefined) {
            const updatedTexts = [...texts];
            updatedTexts[window.lastSelectedTextIndex] = { ...updatedTexts[window.lastSelectedTextIndex], color };
            setTexts(updatedTexts);
        }
    };

    const updateTextSize = (size) => {
        setTextSize(size);
        if (texts.length > 0 && window.lastSelectedTextIndex !== undefined) {
            const updatedTexts = [...texts];
            updatedTexts[window.lastSelectedTextIndex] = { ...updatedTexts[window.lastSelectedTextIndex], fontSize: size };
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
        setTexts(texts.filter((_, i) => i !== index));
    };

    return (
        <div className="create-meme-container">
            <div className="meme-editor">
                <div className="editor-sidebar">
                    <h3>Create Your GIF Meme</h3>
                    
                    <div className="upload-section">
                        <h4>🎬 Upload GIF</h4>
                        <input type="file" accept="image/gif" onChange={handleGifUpload} ref={fileInputRef} style={{display: 'none'}} />
                        <button onClick={() => fileInputRef.current.click()}>Choose GIF File</button>
                        <p className="gif-note">* Supported format: GIF (max 10MB)</p>
                        <p className="instruction-text">💡 Tip: Click and drag text on the GIF to reposition it!</p>
                    </div>

                    <div className="text-section">
                        <h4>✏️ Add Text to GIF</h4>
                        <input type="text" value={currentText} onChange={(e) => setCurrentText(e.target.value)} placeholder="Enter text" />
                        
                        <div className="color-picker-section">
                            <label>🎨 Text Color:</label>
                            <div className="color-preview" style={{ backgroundColor: textColor }}></div>
                            <input type="color" value={textColor} onChange={(e) => updateTextColor(e.target.value)} className="color-input" />
                        </div>

                        <div className="color-presets">
                            {['#FFFFFF','#000000','#FF0000','#00FF00','#0000FF','#FFFF00','#FF00FF','#00FFFF','#FFA500','#800080'].map(c => (
                                <div key={c} className="color-preset" style={{ backgroundColor: c }} onClick={() => updateTextColor(c)} title={c}></div>
                            ))}
                        </div>

                        <div className="font-size-section">
                            <label>📏 Text Size: {textSize}px</label>
                            <input type="range" min="10" max="100" value={textSize} onChange={(e) => updateTextSize(parseInt(e.target.value))} className="size-slider" />
                        </div>

                        <button onClick={addText}>Add Text to GIF</button>
                        <button onClick={generateAICaptions} className="btn-ai" disabled={loadingAI}>
                            {loadingAI ? '🤖 Analyzing GIF with AI...' : '🤖 AI Caption'}
                        </button>
                        
                        {showAICaptions && (
                            <div className="ai-suggestions">
                                <h4>✨ AI-Generated Captions:</h4>
                                {aiSuggestions.map((s, idx) => (
                                    <div key={idx} className="suggestion-item" onClick={() => addAICaption(s)}>
                                        {s}
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
                                            {text.content} (Position: {Math.round(text.x)}, {Math.round(text.y)})
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
                        <button onClick={downloadGifMeme} className="btn-download">📥 Download GIF</button>
                        <button onClick={saveGifToGallery} className="btn-save">💾 Save GIF to Gallery</button>
                    </div>
                </div>

                <div className="editor-canvas">
                    {selectedGif ? (
                        <div 
                            ref={containerRef}
                            className="gif-preview-container"
                            style={{ 
                                cursor: draggingTextIndex !== null ? 'grabbing' : 'grab',
                                position: 'relative',
                                display: 'inline-block'
                            }}
                        >
                            <img src={selectedGif} alt="GIF preview" className="gif-preview" />
                            <div className="gif-text-overlay">
                                {texts.map((text, idx) => (
                                    <div
                                        key={idx}
                                        className="gif-text"
                                        style={{
                                            left: `${(text.x / gifDimensions.width) * 100}%`,
                                            top: `${(text.y / gifDimensions.height) * 100}%`,
                                            color: text.color,
                                            fontSize: `${text.fontSize}px`,
                                            transform: 'translate(-50%, -50%)',
                                            position: 'absolute',
                                            fontWeight: 'bold',
                                            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                                            whiteSpace: 'nowrap',
                                            zIndex: 10,
                                            cursor: 'grab'
                                        }}
                                    >
                                        {text.content}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="no-image">Select a GIF to start creating your GIF meme</div>
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
    const [myGifMemes, setMyGifMemes] = useState([]);
    const [activeTab, setActiveTab] = useState('memes');
    
    useEffect(() => { 
        if (user && !user.isGuest) {
            fetchMyMemes();
            fetchMyGifMemes();
        }
    }, [user]);

    const fetchMyMemes = async () => {
        try {
            const response = await axios.get(`${API_URL}/my-memes`);
            setMyMemes(response.data);
        } catch (error) { console.error(error); }
    };

    const fetchMyGifMemes = async () => {
        try {
            const response = await axios.get(`${API_URL}/my-gif-memes`);
            setMyGifMemes(response.data);
        } catch (error) { console.error(error); }
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
                <div className="gallery-tabs">
                    <button className={`tab-btn ${activeTab === 'memes' ? 'active' : ''}`} onClick={() => setActiveTab('memes')}>
                        📸 My Memes ({myMemes.length})
                    </button>
                    <button className={`tab-btn ${activeTab === 'gifs' ? 'active' : ''}`} onClick={() => setActiveTab('gifs')}>
                        🎬 My GIF Memes ({myGifMemes.length})
                    </button>
                </div>

                {activeTab === 'memes' && (
                    <>
                        {myMemes.length === 0 ? (
                            <p className="no-memes">No memes yet. <button className="link-btn" onClick={() => window.dispatchEvent(new CustomEvent('pageChange', { detail: 'create' }))}>Create one now!</button></p>
                        ) : (
                            <div className="memes-grid">
                                {myMemes.map(meme => (
                                    <div key={meme._id} className="meme-card">
                                        <img src={`http://localhost:5000${meme.imageUrl}`} alt="meme" />
                                        <div className="meme-date">{new Date(meme.createdAt).toLocaleDateString()}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'gifs' && (
                    <>
                        {myGifMemes.length === 0 ? (
                            <p className="no-memes">No GIF memes yet. <button className="link-btn" onClick={() => window.dispatchEvent(new CustomEvent('pageChange', { detail: 'create-gif' }))}>Create one now!</button></p>
                        ) : (
                            <div className="memes-grid">
                                {myGifMemes.map(gif => (
                                    <div key={gif._id} className="meme-card">
                                        <img src={`http://localhost:5000${gif.gifUrl}`} alt="gif meme" />
                                        <div className="meme-date">{new Date(gif.createdAt).toLocaleDateString()}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
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
        const handler = (e) => setCurrentPage(e.detail);
        window.addEventListener('pageChange', handler);
        return () => window.removeEventListener('pageChange', handler);
    }, []);

    useEffect(() => {
        if (user && currentPage === 'login') setCurrentPage('home');
        else if (!user && (currentPage === 'home' || currentPage === 'create' || currentPage === 'create-gif' || currentPage === 'profile')) 
            setCurrentPage('login');
    }, [user, currentPage]);

    const navigate = (page) => setCurrentPage(page);
    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="app">
            <Navbar />
            {currentPage === 'login' && <LoginPage onNavigate={navigate} />}
            {currentPage === 'register' && <RegisterPage onNavigate={navigate} />}
            {currentPage === 'home' && <HomePage onNavigate={navigate} />}
            {currentPage === 'create' && <CreateMemePage />}
            {currentPage === 'create-gif' && <CreateGifMemePage />}
            {currentPage === 'profile' && <ProfilePage />}
        </div>
    );
}

export default function AppWrapper() {
    return (
        <AuthProvider>
            <App />
        </AuthProvider>
    );
}