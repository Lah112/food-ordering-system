import { useEffect, useState } from 'react';
import axios from 'axios';
import './RestaurantApplications.css';

const RestaurantApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', ownerName: '', email: '', phone: '', address: '', cuisineType: ''
  });

  useEffect(() => {
    axios.get('/api/restaurants/applications')
      .then(res => {
        setApplications(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => setApplications([]))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/restaurants/apply', form);
      alert('Restaurant added!');
      setForm({ name: '', ownerName: '', email: '', phone: '', address: '', cuisineType: '' });
      setShowForm(false);
      const res = await axios.get('/api/restaurants/applications');
      setApplications(res.data);
    } catch (err) {
      console.error(err);
      alert('Error submitting form');
    }
  };

  const approve = async (id, phone) => {
    try {
      // First, approve the restaurant
      await axios.patch(`/api/restaurants/approve/${id}`);

      setApplications(applications.filter(app => app._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="restaurant-applications-container">
      <div className="header">
        <h2>New Restaurant Applications</h2>
        <button onClick={() => setShowForm(!showForm)}>+ Add Restaurant</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="restaurant-form">
          <div className="form-grid">
            {["name", "ownerName", "email", "phone", "address", "cuisineType"].map((field) => (
              <input
                key={field}
                name={field}
                placeholder={field.replace(/([A-Z])/g, ' $1')}
                value={form[field]}
                onChange={handleChange}
                required
              />
            ))}
          </div>
          <button type="submit" className="submit-btn">Submit</button>
        </form>
      )}

      {loading ? (
        <p className="status-text">Loading...</p>
      ) : applications.length === 0 ? (
        <p className="status-text">No pending applications.</p>
      ) : (
        <div className="applications-list">
          {applications.map(app => (
            <div key={app._id} className="application-card">
              <p><strong>Name:</strong> {app.name}</p>
              <p><strong>Owner:</strong> {app.ownerName}</p>
              <p><strong>Email:</strong> {app.email}</p>
              <p><strong>Phone:</strong> {app.phone}</p>
              <p><strong>Address:</strong> {app.address}</p>
              <p><strong>Cuisine:</strong> {app.cuisineType}</p>
              <button onClick={() => approve(app._id, app.phone)} className="approve-btn">Approve</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantApplications;
