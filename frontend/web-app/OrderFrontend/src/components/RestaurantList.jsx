// frontend/order/src/components/RestaurantList.jsx
import { Link } from 'react-router-dom';

function RestaurantList({ restaurants }) {
  const sampleImages = [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  ];

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <h2 style={styles.title}>Discover Culinary Delights From Bojun</h2><br></br>
        <p style={styles.subtitle}>Explore our curated selection of premium dining options.Choose your favorite food from favorite restaurant</p><br></br>
        <div style={styles.list}>
          {restaurants.map((restaurant, index) => (
            <Link 
              to={`/restaurants/${restaurant._id}`} 
              key={restaurant._id} 
              style={styles.card}
            >
              <div style={styles.imageContainer}>
                <img 
                  src={restaurant.imageUrl || sampleImages[index % sampleImages.length]} 
                  alt={restaurant.name}
                  style={styles.restaurantImage}
                />
                <div style={styles.overlay}></div>
              </div>
              <div style={styles.cardContent}>
                <h3 style={styles.restaurantName}>{restaurant.name}</h3>
                <div style={styles.metaContainer}>
                  <div style={restaurant.isOpen ? styles.statusOpen : styles.statusClosed}>
                    {restaurant.isOpen ? 'Open Now' : 'Closed'}
                  </div>
                  <div style={styles.cuisineTag}>{restaurant.cuisineType || 'Multi-cuisine'}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    backgroundColor: '#fff5e6', // Light orange background for entire page
    padding: '60px 0'
  },
  container: {
    maxWidth: '1300px',
    margin: '0 auto',
    padding: '0px',
    fontFamily: "'Playfair Display', serif",
  },
  title: {
    color: 'rgb(10, 2, 0)',
    marginBottom: '12px',
    fontSize: '3.5rem',
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: '0.7px',
    lineHeight: '1.3'
  },
  subtitle: {
    color: 'rgba(10, 2, 0, 0.77)',
    marginBottom: '48px',
    fontSize: '1.1rem',
    textAlign: 'center',
    fontWeight: '400',
    fontFamily: "'Inter', sans-serif", //'Inter', system-ui, sans-serif; 
    letterSpacing: '0.4px'
  },
  list: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '36px'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '18px',
   
    textDecoration: 'none',
    color: '#2c3e50',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
  },
  imageContainer: {
    position: 'relative',
    height: '220px',
    overflow: 'hidden'
  },
  restaurantImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.4s ease',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(to bottom, rgba(255,245,230,0.05), rgba(255, 255, 255, 0.6))'
  },
  cardContent: {
    padding: '24px',
    flexGrow: 1
  },
  restaurantName: {
    margin: '0 0 16px 0',
    fontSize: '1.7rem',
    fontWeight: '700',
    color: '#000',
    fontFamily: "'Playfair Display', serif"
  },
  metaContainer: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },
  statusOpen: {
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
    color: '#27ae60',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '600',
    fontFamily: "'Inter', sans-serif",
    border: '1px solid rgba(46, 204, 113, 0.3)'
  },
  statusClosed: {
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    color: '#c0392b',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '600',
    fontFamily: "'Inter', sans-serif",
    border: '1px solid rgba(231, 76, 60, 0.3)'
  },
  cuisineTag: {
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    color: '#2980b9',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '600',
    fontFamily: "'Inter', sans-serif",
    border: '1px solid rgba(52, 152, 219, 0.3)'
  }
};

export default RestaurantList;
