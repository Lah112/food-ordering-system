import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

const SearchResults = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/food/list?search=${query}`);
        if (response.data.success) {
          setFoods(response.data.data);
        } else {
          setError("No results found");
        }
      } catch (error) {
        setError("An error occurred while fetching search results");
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchData();
    } else {
      setLoading(false);
      setError("Please enter a search query");
    }
  }, [query]);

  return (
    <div>
      <h2>Search Results</h2>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {!loading && !error && (
        <div>
          {foods.length === 0 ? (
            <p>No results found</p>
          ) : (
            foods.map((food) => (
              <div key={food._id}>
                <h3>{food.name}</h3>
                <p>{food.description}</p>
                <p>${food.price}</p>
                <img src={`/images/${food.image}`} alt={food.name} />

              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
