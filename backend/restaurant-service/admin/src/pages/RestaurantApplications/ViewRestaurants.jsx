import { useEffect, useState } from 'react';
import axios from 'axios';
import './ViewRestaurants.css';

const ViewRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRestaurant, setCurrentRestaurant] = useState(null);

  useEffect(() => {
    axios.get('/api/restaurants/approved')
      .then(res => {
        setRestaurants(res.data);
      })
      .catch(() => {
        setRestaurants([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentRestaurant((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.patch(`/api/restaurants/update/${currentRestaurant._id}`, currentRestaurant);
      setRestaurants(restaurants.map((rest) => (rest._id === currentRestaurant._id ? response.data : rest)));
      setIsEditing(false);
      alert('Restaurant updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Error updating restaurant');
    }
  };

  const handleUpdate = (restaurant) => {
    setIsEditing(true);
    setCurrentRestaurant(restaurant);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/restaurants/delete/${id}`);
      alert('Restaurant deleted successfully!');
      setRestaurants(restaurants.filter((rest) => rest._id !== id));
    } catch (err) {
      console.error(err);
      alert('Error deleting restaurant');
    }
  };

  const handleToggleAvailability = async (id, currentAvailability) => {
    try {
      const response = await axios.patch(`/api/restaurants/update-availability/${id}`, {
        availability: !currentAvailability
      });
      setRestaurants(restaurants.map((rest) => rest._id === id ? response.data : rest));
    } catch (err) {
      console.error(err);
      alert('Error updating availability');
    }
  };

  return (
    <div className="view-restaurants-container">
      <h2>Approved Restaurants</h2>
      {loading ? (
        <p>Loading...</p>
      ) : restaurants.length === 0 ? (
        <p>No approved restaurants found.</p>
      ) : (
        <div className="restaurants-list">
          {restaurants.map((rest) => (
            <div key={rest._id} className="restaurant-card">
              <h3>{rest.name}</h3>
              <p><strong>Owner:</strong> {rest.ownerName}</p>
              <p><strong>Phone:</strong> {rest.phone}</p>
              <p><strong>Email:</strong> {rest.email}</p>
              <p><strong>Address:</strong> {rest.address}</p>
              <p><strong>Cuisine:</strong> {rest.cuisineType}</p>

              {/* Availability Toggle */}
              <div className="availability-toggle">
                <button
                  onClick={() => handleToggleAvailability(rest._id, rest.availability)}
                  className={rest.availability ? 'available-btn' : 'unavailable-btn'}>
                  {rest.availability ? 'Available' : 'Unavailable'}
                </button>
              </div>

              {/* Update and Delete Buttons */}
              <button onClick={() => handleUpdate(rest)} className="update-btn">Update</button>
              <button onClick={() => handleDelete(rest._id)} className="delete-btn">Delete</button>
            </div>
          ))}
        </div>
      )}

      {isEditing && currentRestaurant && (
        <div className="edit-form-container">
          <h3>Edit Restaurant</h3>
          <form onSubmit={handleSubmitUpdate} className="edit-form">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={currentRestaurant.name}
              onChange={handleInputChange}
            />

            <label htmlFor="ownerName">Owner Name</label>
            <input
              type="text"
              id="ownerName"
              name="ownerName"
              value={currentRestaurant.ownerName}
              onChange={handleInputChange}
            />

            <label htmlFor="phone">Phone</label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={currentRestaurant.phone}
              onChange={handleInputChange}
            />

            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={currentRestaurant.email}
              onChange={handleInputChange}
            />

            <label htmlFor="address">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={currentRestaurant.address}
              onChange={handleInputChange}
            />

            <label htmlFor="cuisineType">Cuisine Type</label>
            <input
              type="text"
              id="cuisineType"
              name="cuisineType"
              value={currentRestaurant.cuisineType}
              onChange={handleInputChange}
            />

            <button type="submit" className="submit-btn">Save Changes</button>
            <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ViewRestaurants;
