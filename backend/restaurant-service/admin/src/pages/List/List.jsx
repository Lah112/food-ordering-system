/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import './List.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const List = ({ url }) => {
  const [list, setList] = useState([]);
  const [editData, setEditData] = useState(null);

  const fetchList = async () => {
    try {
      const response = await axios.get(`${url}/api/food/list`);
      if (response.data.success) {
        setList(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Failed to fetch food list");
      console.error("Error fetching food list:", error);
    }
  };

  const removeFood = async (foodId) => {
    try {
      const response = await axios.post(`${url}/api/food/remove`, { id: foodId });
      await fetchList();
      if (response.data.success) {
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Failed to remove food item");
      console.error("Error removing food item:", error);
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await axios.post(`${url}/api/food/update`, {
        id: editData._id, // 👈 sending correct id
        name: editData.name,
        category: editData.category,
        price: editData.price,
      });
      if (response.data.success) {
        toast.success(response.data.message);
        setEditData(null);
        fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Failed to update food item");
      console.error("Error updating food item:", error);
    }
  };
  
  useEffect(() => {
    fetchList();
  }, []);

  useEffect(() => {
    console.log(list);
  }, [list]);

  return (
    <div className='list add flex-col'>
      <p>All Food List</p>
      <div className='list-table'>
        <div className='list-table-format title'>
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b>Action</b>
        </div>
        {list.map((item, index) => (
          <div key={index} className='list-table-format'>
            <img src={`${url}/images/${item.image}`} alt="" />
            <p>{item.name}</p>
            <p>{item.category}</p>
            <p>Rs {item.price}</p>
            <div className="cursor-group">
              <p onClick={() => removeFood(item._id)} className='cursor'>X</p>
              <p onClick={() => setEditData(item)} className='cursor' style={{ color: "#4caf50" }}>✎</p>
            </div>
          </div>
        ))}
      </div>

      {/* Update Modal */}
      {editData && (
        <div className="modal">
          <div className="modal-content">
            <h3>Update Food</h3>
            <input
              type="text"
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              placeholder="Name"
            />
            <input
              type="text"
              value={editData.category}
              onChange={(e) => setEditData({ ...editData, category: e.target.value })}
              placeholder="Category"
            />
            <input
              type="number"
              value={editData.price}
              onChange={(e) => setEditData({ ...editData, price: e.target.value })}
              placeholder="Price"
            />
            <div className="modal-actions">
              <button onClick={handleUpdate}>Update</button>
              <button onClick={() => setEditData(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default List;
