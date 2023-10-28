import { useEffect, useRef, useState } from "react";
import StarRating from "./starRating.js";
import { useMovies } from "./useMovies.js";
import { useLocalStorage } from "./useLocalStorage.js";
import { useKey } from "./useKey.js";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const apiKey = "5b5cc2d3";

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const { movies, isloading, error } = useMovies(query);
  const [watched, setWatched] = useLocalStorage([], "watched");
  const [btnExpandSearches, setExpandSearches] = useState(true);
  const [btnExpandMovieDetails, setExpandMovieDetails] = useState(
    window.innerWidth <= 600 ? false : true
  );
  console.log(btnExpandMovieDetails);

  function handleSelectedId(id) {
    setSelectedId((selectedId) => (selectedId === id ? null : id));
    if (window.innerWidth < 500) {
      handleExpandMovieDetails();
    }
  }

  function handleAddWatched(movie) {
    setSelectedId(null);
    setWatched((watched) => [...watched, movie]);
  }

  function handleRemoveWatched(id) {
    const filtered = watched.filter((movie) => movie.imdbId !== id);
    setWatched(filtered);
  }

  function onCloseMovie() {
    setSelectedId(null);
  }

  function handleExpandSearches() {
    if (btnExpandMovieDetails) {
      setExpandMovieDetails(false);
      setExpandSearches(true);
    }
  }
  function handleExpandMovieDetails() {
    if (!btnExpandMovieDetails) {
      setExpandMovieDetails(true);
      setExpandSearches(false);
    }
  }

  return (
    <>
      <NavBar>
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>
      <ToggleButtons>
        <Button
          onClick={handleExpandSearches}
          className={`btn-500px ${btnExpandSearches ? "active" : null}`}
        >
          Search Results
        </Button>
        <Button
          onClick={handleExpandMovieDetails}
          className={`btn-500px ${btnExpandMovieDetails ? "active" : null}`}
        >
          Movie Details
        </Button>
      </ToggleButtons>

      <Main>
        {btnExpandSearches && (
          <Box>
            {isloading && <Loader />}
            {!isloading && !error && (
              <MovieList movies={movies} handleSelectedId={handleSelectedId} />
            )}
            {error && <Error>{error}</Error>}
          </Box>
        )}
        {btnExpandMovieDetails && (
          <Box>
            {selectedId ? (
              <MovieDetails
                selectedId={selectedId}
                onHandleAdd={handleAddWatched}
                watched={watched}
                onCloseMovie={onCloseMovie}
              />
            ) : (
              <>
                <WatchedSummary watched={watched} />
                <WatchedList watched={watched} onClick={handleRemoveWatched} />
              </>
            )}
          </Box>
        )}
      </Main>
    </>
  );
}

function Loader() {
  return <p className="loader">Loading...</p>;
}

function Error({ children }) {
  return <p className="error">{children}</p>;
}

function NavBar({ children }) {
  return <nav className="nav-bar">{children}</nav>;
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>CenimaNow</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  const inputElement = useRef(null);

  useKey(function () {
    if (document.activeElement !== inputElement) {
      inputElement.current.focus();
    } else return;
  }, "Enter");

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputElement}
    />
  );
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

//* Movie List Box
function Box({ children, className }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className={`box ${className}`}>
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function MovieList({ movies, handleSelectedId }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie, i) => (
        <li key={movie.imdbID} onClick={() => handleSelectedId(movie.imdbID)}>
          <img src={movie.Poster} alt={`${movie.Title} poster`} />
          <h3>{movie.Title}</h3>
          <div>
            <p>
              <span>🗓</span>
              <span>{movie.Year}</span>
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function MovieDetails({ selectedId, onHandleAdd, watched, onCloseMovie }) {
  const [movieDetails, setMovieDetails] = useState({});
  const [isLoading, setisLoading] = useState(false);
  const [userRating, setUserRating] = useState("");
  const checkWatched = watched.map((curr) => curr.imdbId).includes(selectedId);
  const curRating = watched.find((movie) => movie.imdbId === selectedId);

  const countDecisions = useRef(0);

  useEffect(
    function () {
      if (userRating) countDecisions.current = countDecisions.current + 1;
    },
    [userRating]
  );

  const {
    Title,
    Poster,
    Ratings,
    BoxOffice,
    Actors,
    Language,
    Genre,
    Released,
    Runtime,
    Writer,
    Year,
    imdbRating,
    Director,
    Plot,
  } = movieDetails;

  useKey(onCloseMovie, "Escape");

  function handleAdd() {
    const newlyAddedMovie = {
      imdbId: selectedId,
      Title,
      Year,
      Poster,
      imdbRating: Number(imdbRating),
      Runtime: Number(Runtime.split(" ").at(0)),
      userRating,
      userRatingDecisionsCount: countDecisions.current,
    };
    onHandleAdd(newlyAddedMovie);
  }

  useEffect(
    function () {
      async function getMovieDetails() {
        setisLoading(true);
        const response = await fetch(
          `http://www.omdbapi.com/?apikey=${apiKey}&i=${selectedId}`
        );
        const data = await response.json();
        setMovieDetails(data);
        setisLoading(false);
      }

      getMovieDetails();
    },
    [selectedId]
  );

  useEffect(
    function () {
      if (!Title) return;
      document.title = `Movie | ${Title}`;

      //* This function fires when the Title unmounts
      return function () {
        document.title = "Cenima Now";
      };
    },
    [Title]
  );

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={() => onCloseMovie()}>
              &larr;
            </button>
            <img src={Poster} alt={`poster of ${Title}`}></img>
            <div className="details-overview">
              <h2>{Title}</h2>
              <p>
                {Released} &bull; {Runtime}
              </p>
              <p>{Genre}</p>
              <p>
                <span>⭐</span> {imdbRating} imdb Rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!checkWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={28}
                    color="yellow"
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={() => handleAdd()}>
                      Add to list
                    </button>
                  )}
                </>
              ) : (
                `You've rated the movie ${curRating?.userRating}/10 ⭐`
              )}
            </div>

            <p>
              <em>{Plot}</em>
            </p>
            <p>BoxOffice : {BoxOffice}</p>
            <p>Starring : {Actors}</p>
            <p>Directed By: {Director}</p>
            <p>Writer : {Writer}</p>
            <div>
              Ratings :
              {Ratings?.map((a, i) => (
                <p key={i}>
                  <span>{a.Source}</span> <span>{a.Value}</span>
                </p>
              ))}
            </div>
            <p>Language : {Language}</p>
          </section>
        </>
      )}
    </div>
  );
}

function WatchedSummary({ watched, onClick }) {
  const avgImdbRating = average(
    watched.map((movie) => movie.imdbRating)
  ).toFixed(2);
  const avgUserRating = average(
    watched.map((movie) => movie.userRating)
  ).toFixed(2);
  const avgRuntime = average(watched.map((movie) => movie.Runtime)).toFixed(1);

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min </span>
        </p>
      </div>
    </div>
  );
}

function WatchedList({ watched, onClick }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <li key={movie.imdbId}>
          <img src={movie.Poster} alt={`${movie.Title} poster`} />
          <h3>{movie.Title}</h3>
          <div>
            <p>
              <span>⭐️</span>
              <span>{movie.imdbRating}</span>
            </p>
            <p>
              <span>🌟</span>
              <span>{movie.userRating}</span>
            </p>
            <p>
              <span>⏳</span>
              <span>{movie.runtime} min</span>
            </p>
            <button
              onClick={() => onClick(movie.imdbId)}
              className="btn-delete"
            >
              -
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

function ToggleButtons({ children }) {
  return <div className="toggle-Buttons">{children}</div>;
}
function Button({ children, className, onClick }) {
  return (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  );
}
