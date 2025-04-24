import { useState } from 'react';
import axios from 'axios';


const AddRestaurant = () => {
  const [form, setForm] = useState({
    name: '', ownerName: '', email: '', phone: '', address: '', cuisineType: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/restaurants/apply', form);
      alert('Restaurant application submitted!');
      setForm({ name: '', ownerName: '', email: '', phone: '', address: '', cuisineType: '' });
    } catch (err) {
      console.error(err);
      alert('Something went wrong');
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Add New Restaurant</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {["name", "ownerName", "email", "phone", "address", "cuisineType"].map((field) => (
          <input
            key={field}
            name={field}
            placeholder={field.replace(/([A-Z])/g, ' $1')}
            value={form[field]}
            onChange={handleChange}
            required={field === "name"}
            className="w-full p-2 border rounded"
          />
        ))}
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Submit Application
        </button>
      </form>
    </div>
  );
};

export default AddRestaurant;
