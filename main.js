import extraStep from "./modKey.js";

// API
const baseUrl = 'https://api.themoviedb.org/3';
const requestKey = `?api_key=${extraStep}`;
const langSuffix = '&language=en-US'; // Not needed as English is the default
const genresPath = '/genre/movie/list';
const discoverMoviePath = '/discover/movie';
const withGenres = '&with_genres=';
const movieDetailsPath = '/movie/';
const baseImageUrl = 'https://image.tmdb.org/t/p/w500';

// Index of current movie being displayed
let currentSelection = 0;

// DOM
const genreDropdown = document.getElementById('genresList');
const chooseDiv = document.getElementById('choose');
const movieBtn = document.getElementById('movie-btn');
const displayDiv = document.getElementById('display');
const posterDiv = document.getElementById('poster');
const infoDiv = document.getElementById('info');

// GET genre list from API  ===================================================
const getGenres = async () => {
  const endpoint = baseUrl + genresPath + requestKey;
  try {
    let response = await fetch(endpoint);
    if (response.ok) {
      let jsonResponse = await response.json();
      let genres = jsonResponse.genres;
      return genres;
    }
    throw new Error(`Request failed. Status: ${response.status};`);
  } catch (error) {
      console.log(error);
      let message = document.createElement('option');
      message.value = null;
      message.text = "ERROR: GENRES UNAVAILABLE";
      genreDropdown.style.fontSize = "1.125rem";
      genreDropdown.style.padding = "0.5rem";
      genreDropdown.style.color = "darkred";
      genreDropdown.style.fontWeight = "bold";
      genreDropdown.appendChild(message);
  }
}

// Activate 'Pick a genre' dropdown
getGenres().then(displayGenres);

// GET movie from API  ========================================================
const selectedGenre = () => {
  let selectedGenreId = genreDropdown.value;
  return selectedGenreId;
}
const getDiscoverMovie = async () => {
  const endpoint = baseUrl + discoverMoviePath + requestKey + withGenres;
  try {
    let response = await fetch(endpoint + selectedGenre());
    if (response.ok) {
      let jsonResponse = await response.json();
      console.log("DISCOVER MOVIE OBJECT:", jsonResponse);                    // TEST
      let movies = jsonResponse.results;
      console.log("DISCOVER MOVIE RESULTS PROPERTY array of objects:", movies); // TEST
      let details = await getMovieDetails(movies[currentSelection].id);
      console.log("movies[currentSelection].id:", movies[currentSelection].id); // TEST
      console.log("movies[currentSelection].id:", typeof movies[currentSelection].id); // TEST
      console.log("details:", details);                                      // TEST
      displayMovie(movies, details);
    }
  } catch (error) {
    console.log(error);           // TODO ?
  }
}

// GET movie details from API  ================================================
async function getMovieDetails(movieId) {
  const endpoint = baseUrl + movieDetailsPath + movieId + requestKey;
  console.log("endpoint:", endpoint);                                      // TEST
  try {
    let response = await fetch(endpoint);
    if (response.ok) {
      let detailsObj = await response.json();
      console.log("detailsObj:", detailsObj);                              // TEST
      return detailsObj;
    }
  } catch (error) {
    console.log(error);           // TODO ?
  }
}

// Display genres in dropdown  ================================================
function displayGenres(genresArr) {
  for (let genreObj of genresArr) {
    let option = document.createElement('option');
    option.value = genreObj.id;
    option.text = genreObj.name;
    genreDropdown.appendChild(option);
  }
}

// Display movie info  ========================================================
function displayMovie(movies, details) {
  // Clear out display
  if (posterDiv.firstChild) posterDiv.removeChild(posterDiv.firstChild);
  infoDiv.textContent = '';
  // Movie poster
  let poster = document.createElement('img');
  poster.setAttribute('src', baseImageUrl + movies[currentSelection].poster_path);
  poster.style.width = "250px";
  posterDiv.appendChild(poster);
  // Movie title
  let title = document.createElement('h2');
  title.textContent = movies[currentSelection].title;
  title.style.color = '#FFF';
  title.style.textShadow = '1px 1px 1px #000';
  infoDiv.appendChild(title);
  // Movie description
  let description = document.createElement('p');
  description.style.fontSize = '18px';
  description.textContent = movies[currentSelection].overview;
  infoDiv.appendChild(description);
  // Movie runtime (uses movie details endpoint)
  let runtime = document.createElement('p');
  runtime.textContent = `Runtime: ${details.runtime} mins.`;
  runtime.style.fontWeight = '600';
  infoDiv.appendChild(runtime);
  // Movie release date
  let releaseDate = document.createElement('p');
  releaseDate.textContent = `Release date: ${movies[currentSelection].release_date}`;
  infoDiv.appendChild(releaseDate);
}

// Register event listener  ===================================================
movieBtn.addEventListener('click', getDiscoverMovie);
