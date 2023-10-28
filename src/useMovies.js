import { useState, useEffect } from "react";

const apiKey = "5b5cc2d3";

export function useMovies(query) {
  const [movies, setMovies] = useState([]);
  const [isloading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(
    function () {
      const controller = new AbortController();
      async function fetchData() {
        try {
          setIsLoading(true);
          setError("");
          const response = await fetch(
            `https://www.omdbapi.com/?apikey=${apiKey}&s=${query}`,
            { signal: controller.signal }
          );
          if (!response.ok) throw new Error("Something went wrong");

          const data = await response.json();

          if (data.Response === "False") throw new Error("Movie not found !");

          setMovies(data.Search);
          setIsLoading(false);
        } catch (error) {
          if (error.name !== "AbortError") {
            setIsLoading(false);
            setError(error.message);
          }
        } finally {
          setIsLoading(false);
        }
      }
      if (query.length <= 2) {
        setMovies([]);
        return;
      }

      fetchData();

      return function () {
        controller.abort();
      };
    },
    [query]
  );
  return { movies, isloading, error };
}
