import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import { assets } from '../../assets/assets';
import './SideBar.css';

const SideBar = () => {
  const [showManageUsers, setShowManageUsers] = useState(false);

  return (
    <div className='sidebar'>
      <div className='sidebar-options'>
        <NavLink to='/add' className='sidebar-option'>
          <img src={assets.add_icon} alt="" />
          <p>Add Items</p>
        </NavLink>
        <NavLink to='/list' className='sidebar-option'>
          <img src={assets.order_icon} alt="" />
          <p>List Items</p>
        </NavLink>
        <NavLink to='/orders' className='sidebar-option'>
          <img src={assets.order_icon} alt="" />
          <p>Orders</p>
        </NavLink>

        {/* Manage Users with Dropdown */}
        <div className='sidebar-option' onClick={() => setShowManageUsers(!showManageUsers)} style={{ cursor: 'pointer' }}>
          <img src={assets.user_icon || assets.order_icon} alt="" />
          <p>Manage Users</p>
        </div>

        {showManageUsers && (
          <div className='sidebar-sub-options'>
            <NavLink to='/admin/manage-users' className='sidebar-sub-option'>
              View Users
            </NavLink>
            <NavLink to='/admin/user-activity' className='sidebar-sub-option'>
              User Activity
            </NavLink>
            <NavLink to='/admin/pending-verifications' className='sidebar-sub-option'>
              Pending Verifications
            </NavLink>
          </div>
        )}
      </div>
    </div>
  );
};

export default SideBar;
