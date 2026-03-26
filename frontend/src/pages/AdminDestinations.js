import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import { getAdminDestinations, deleteDestination, uploadDestination, updateDestination } from '../services/api';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';

function AdminDestinations() {
    const navigate = useNavigate();
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const [destForm, setDestForm] = useState({
        name: '',
        altitude_range: '',
        trekking_complexity: '',
        duration: '',
        price_range: '',
        region: '',
        description: '',
        image: null
    });

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            navigate('/login');
            return;
        }
        try {
            const userObj = JSON.parse(userStr);
            if (userObj.role !== 'admin') {
                navigate('/');
                return;
            }
        } catch (e) {
            navigate('/login');
            return;
        }
        fetchAdminDestinations();
    }, [navigate]);

    const fetchAdminDestinations = async () => {
        setLoading(true);
        try {
            const destRes = await getAdminDestinations();
            setDestinations(destRes.data || []);
        } catch (err) {
            setError('Could not load destinations.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteDestination = async (id) => {
        if (!window.confirm('Are you sure you want to delete this destination?')) return;
        try {
            await deleteDestination(id);
            setSuccessMessage('Destination deleted successfully!');
            fetchAdminDestinations();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete destination.');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleUploadChange = (e) => {
        if (e.target.name === 'image') {
            setDestForm({ ...destForm, image: e.target.files[0] });
        } else {
            setDestForm({ ...destForm, [e.target.name]: e.target.value });
        }
    };

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (!destForm.name) {
            setError('Destination name is required.');
            setTimeout(() => setError(''), 3000);
            return;
        }
        
        const fd = new FormData();
        Object.keys(destForm).forEach(key => {
            if (destForm[key] !== null) {
                fd.append(key, destForm[key]);
            }
        });

        try {
            if (isEditing) {
                await updateDestination(editId, fd);
                setSuccessMessage('Destination updated successfully!');
            } else {
                await uploadDestination(fd);
                setSuccessMessage('Destination uploaded successfully!');
            }
            
            setDestForm({
                name: '', altitude_range: '', trekking_complexity: '',
                duration: '', price_range: '', region: '', description: '', image: null
            });
            setIsEditing(false);
            setEditId(null);
            fetchAdminDestinations();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'upload'} destination.`);
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleEditClick = (dest) => {
        setDestForm({
            name: dest.name || '',
            altitude_range: dest.altitude_range || '',
            trekking_complexity: dest.trekking_complexity || '',
            duration: dest.duration || '',
            price_range: dest.price_range || '',
            region: dest.region || '',
            description: dest.description || '',
            image: null // Don't pre-populate image file
        });
        setIsEditing(true);
        setEditId(dest.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setDestForm({
            name: '', altitude_range: '', trekking_complexity: '',
            duration: '', price_range: '', region: '', description: '', image: null
        });
        setIsEditing(false);
        setEditId(null);
    };

    return (
        <div className="admin-dashboard">
            <AdminNavbar />
            <main className="admin-dashboard-main">
                <header className="admin-header">
                    <h1>Manage Destinations</h1>
                    <p>Upload and oversee live destinations for public users.</p>
                </header>

                {error && <div className="admin-error">{error}</div>}
                {successMessage && <div className="admin-success">{successMessage}</div>}

                <div className="destinations-management">
                    <div className="upload-section admin-content" style={{ padding: '20px' }}>
                        <h2>{isEditing ? 'Edit Destination' : 'Upload New Destination'}</h2>
                        <form onSubmit={handleUploadSubmit} className="upload-form" style={{ backgroundColor: 'transparent', border: 'none', padding: 0 }}>
                            <div className="form-group">
                                <label>Destination Name *</label>
                                <input type="text" name="name" value={destForm.name} onChange={handleUploadChange} required placeholder="e.g. Everest Base Camp" />
                            </div>
                            <div className="form-group">
                                <label>Altitude Range</label>
                                <input type="text" name="altitude_range" value={destForm.altitude_range} onChange={handleUploadChange} placeholder="e.g. 2,860m - 5,364m" />
                            </div>
                            <div className="form-group">
                                <label>Trekking Complexity</label>
                                <select name="trekking_complexity" value={destForm.trekking_complexity} onChange={handleUploadChange}>
                                    <option value="">Select Complexity</option>
                                    <option value="Easy">Easy</option>
                                    <option value="Moderate">Moderate</option>
                                    <option value="Strenuous">Strenuous</option>
                                    <option value="Challenging">Challenging</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Duration</label>
                                <input type="text" name="duration" value={destForm.duration} onChange={handleUploadChange} placeholder="e.g. 14 Days" />
                            </div>
                            <div className="form-group">
                                <label>Price Range</label>
                                <input type="text" name="price_range" value={destForm.price_range} onChange={handleUploadChange} placeholder="e.g. $1000 - $1500" />
                            </div>
                            <div className="form-group">
                                <label>Region</label>
                                <input type="text" name="region" value={destForm.region} onChange={handleUploadChange} placeholder="e.g. Himalayas, Nepal, Everest" />
                            </div>
                            <div className="form-group full-width">
                                <label>Description</label>
                                <textarea name="description" value={destForm.description} onChange={handleUploadChange} rows="2" placeholder="Brief description..."></textarea>
                            </div>
                            <div className="form-group full-width">
                                <label>Cover Image</label>
                                <input type="file" name="image" onChange={handleUploadChange} accept="image/*" />
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="submit-btn text-white bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-md transition duration-200">
                                    {isEditing ? 'Update Destination' : 'Upload Destination'}
                                </button>
                                {isEditing && (
                                    <button type="button" onClick={cancelEdit} className="cancel-btn bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition" style={{ marginLeft: '10px' }}>
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="existing-destinations admin-content" style={{ padding: '20px' }}>
                        <h2>Existing Destinations</h2>
                        {loading ? <p>Loading...</p> : (
                            <div className="admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Name</th>
                                            <th>Complexity</th>
                                            <th>Duration</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {destinations.map(dest => (
                                            <tr key={dest.id}>
                                                <td>{dest.id}</td>
                                                <td>
                                                    <Link to={`/destinations/${dest.id}`} className="admin-dest-link" style={{ color: '#1d4ed8', fontWeight: '600' }}>
                                                        {dest.name}
                                                    </Link>
                                                </td>
                                                <td>{dest.trekking_complexity || '-'}</td>
                                                <td>{dest.duration || '-'}</td>
                                                <td>
                                                    <button 
                                                        className="edit-btn"
                                                        onClick={() => handleEditClick(dest)}
                                                        style={{ marginRight: '8px', backgroundColor: '#fbbf24', color: 'white', border: 'none', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer' }}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        className="delete-btn"
                                                        onClick={() => handleDeleteDestination(dest.id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {destinations.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="empty-message">No destinations uploaded yet.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default AdminDestinations;
