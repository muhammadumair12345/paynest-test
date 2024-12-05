import axios from "axios";
import React, { Suspense, useEffect, useState, useCallback } from "react";

const CountryCard = React.lazy(() => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        default: ({ country }) => (
          <div className="bg-white rounded-md shadow w-full h-[10rem]">
            <div className="p-4">
              <img
                src={country.flags.png}
                className="w-16 h-10 object-cover"
                alt={country.flags.alt || "Country flag"}
              />
            </div>
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">
                {country.name.common}
              </h2>
              <p>Population: {country.population.toLocaleString()}</p>
            </div>
          </div>
        ),
      });
    }, 1000);
  });
});

const App = () => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchCountries = async (url) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(url);
      const fetchedCountries = res.data;
      setCountries(fetchedCountries);
      if (!fetchedCountries.length) {
        setError("No countries found");
      }
    } catch (err) {
      setError("An error occurred while fetching countries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries(
      "https://restcountries.com/v3.1/all?fields=name,flags,population"
    );
  }, []);

  // Custom debounce function
  const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };

  const searchCountry = useCallback(
    debounce((query) => {
      if (query) {
        fetchCountries(
          `https://restcountries.com/v3.1/name/${query}?fields=name,flags,population`
        );
      } else {
        fetchCountries(
          "https://restcountries.com/v3.1/all?fields=name,flags,population"
        );
      }
    }, 500),
    []
  );

  const handleInputChange = (e) => {
    searchCountry(e.target.value.trim());
  };

  return (
    <main className="bg-gray-100 w-full min-h-screen flex items-center p-8">
      <div className="flex gap-4 flex-col w-full">
        <section className="mb-4">
          <input
            type="search"
            placeholder="Search by name"
            className="w-full px-2 py-3 focus:ring-2 focus:ring-black outline-none border-none rounded-md"
            onChange={handleInputChange}
          />
        </section>
        <section className="w-full h-[50rem] overflow-auto">
          {loading ? (
            <div className="w-full h-full flex justify-center items-center text-red-700">
              <div className="border-2 w-10 h-10 border-gray-400 rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="w-full h-full text-lg flex justify-center items-center text-red-700">
              <div>{error}</div>
            </div>
          ) : countries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-h-full rounded-md">
              {countries.map((country) => (
                <Suspense
                  key={country.name.common}
                  fallback={
                    <div className="bg-gray-200 rounded-lg shadow h-[10rem] animate-pulse"></div>
                  }
                >
                  <CountryCard country={country} />
                </Suspense>
              ))}
            </div>
          ) : (
            <div className="w-full h-full flex text-lg justify-center items-center text-red-700">
              No countries found
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default App;
