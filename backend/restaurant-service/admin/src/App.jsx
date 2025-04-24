import Navbar from './components/Navbar/Navbar'
import SideBar from './components/SideBar/SideBar'
import { Route, Routes } from 'react-router-dom'
import Add from './pages/Add/Add'
import List from './pages/List/List'
import Orders from './pages/Orders/Orders'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import ManageUsers from './pages/Users/ManageUsers.jsx'
import RestaurantApplications from './pages/RestaurantApplications/RestaurantApplications.jsx';
import AddRestaurant from './pages/RestaurantApplications/AddRestaurant.jsx';


const App = () => {

  const url = import.meta.env.VITE_APP_URL

  console.log(url);
  return (
    <div>
      <ToastContainer/>
      <Navbar/>
      <hr/>
      <div className='app-content'>
        <SideBar/>
        <Routes>
          <Route path='/add' element={<Add url={url}/>}/>
          <Route path='/list' element={<List url={url}/>}/>
          <Route path='/orders' element={<Orders url={url}/>}/>
          <Route path='/admin/manage-users' element={<ManageUsers url={url} />} />
          <Route path="/admin/restaurant-applications" element={<RestaurantApplications />} />
          <Route path="/admin/add-restaurant" element={<AddRestaurant />} />
          

        </Routes>
      </div>
    </div>
  )
}

export default App