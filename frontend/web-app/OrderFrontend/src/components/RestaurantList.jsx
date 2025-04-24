// frontend/order/src/components/RestaurantList.jsx
import { Link } from 'react-router-dom';

function RestaurantList({ restaurants }) {
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Available Restaurants</h2>
      <div style={styles.list}>
        {restaurants.map(restaurant => (
          <Link 
            to={`/restaurants/${restaurant._id}`} 
            key={restaurant._id} 
            style={styles.card}
          >
            <h3>{restaurant.name}</h3>
            <p>{restaurant.isOpen ? 'Open Now' : 'Closed'}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  title: {
    color: '#333',
    marginBottom: '20px'
  },
  list: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px'
  },
  card: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textDecoration: 'none',
    color: '#333',
    transition: 'transform 0.2s',
    ':hover': {
      transform: 'translateY(-5px)'
    }
  }
};

export default RestaurantList;