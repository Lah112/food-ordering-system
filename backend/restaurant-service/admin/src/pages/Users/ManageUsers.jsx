/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import axios from 'axios';
import './ManageUsers.css';
import { toast } from 'react-toastify';

const ManageUsers = ({ url }) => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${url}/api/admin/users`);
      setUsers(res.data);
    } catch (err) {
      toast.error('Failed to fetch users');
    }
  };

  const deleteUser = async (userId) => {
    try {
      await axios.delete(`${url}/api/admin/users/${userId}`);
      toast.success('User deleted');
      setUsers(users.filter(user => user._id !== userId));
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className='manage-users'>
      <h2>Manage Users</h2>
      <div className='user-list'>
        {users.map(user => (
          <div className='user-card' key={user._id}>
            <div>
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> {user.role}</p>
            </div>
            <button onClick={() => deleteUser(user._id)} className='delete-btn'>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageUsers;
