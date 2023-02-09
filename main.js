import extraStep from "./modKey.js";

// API
const baseUrl = 'https://api.themoviedb.org/3';
const requestKey = `?api_key=${extraStep}`;
const langSuffix = '&language=en-US'; // Not needed as English is the default
const genresPath = '/genre/movie/list';
const discoverMoviePath = '/discover/movie';
const withGenres = '&with_genres=';
const movieDetailsPath = '/movie/';
const baseImageUrl = 'https://image.tmdb.org/t/p/w500'; // as width 500px

// Index of current movie being displayed
let currentSelection = 0;

// DOM
const genreDropdown = document.getElementById('genresList');
const chooseDiv = document.getElementById('choose');
const movieBtn = document.getElementById('movie-btn');
const displayDiv = document.getElementById('display');

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
      // The twenty movies discovered
      let movies = jsonResponse.results;
      console.log("DISCOVER MOVIE RESULTS PROPERTY array of objects:", movies); // TEST
      // Collect runtimes, language & tagline of the twenty movies in details API
      let tagline = [];
      let runtimes = [];
      let language = [];
      for (let each = 0; each < movies.length; each++) {                       // ADJUST FOR PAGES?!
        let details = await getMovieDetails(movies[each].id);
        tagline.push(details.tagline);
        runtimes.push(details.runtime);
        language.push((details.original_language === "en") ? null: (details.spoken_languages.length === 0) ? null: details.spoken_languages[0].english_name);
      }
      console.log("runtimes:", runtimes);                                      // TEST
      // Send the twenty movies info to be displayed
      displayMovie(movies, tagline, runtimes, language);
    }
  } catch (error) {
    console.log(error);           // TODO ?
  }
}

// GET movie details from API  ================================================
async function getMovieDetails(movieId) {                                      // WHEN ACCESS?
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
function displayMovie(movies, tagline, runtimes, language) {
  // Clear out display
  for (let selection = 0; selection < movies.length; selection++) {
    if (displayDiv.firstChild) displayDiv.removeChild(displayDiv.firstChild);
  }
  // Group of twenty movies
  for (let selection = 0; selection < movies.length; selection++) {
    // Container for one of twenty movies
    let movieOptionDiv = document.createElement('div');
    movieOptionDiv.setAttribute('class', "movieOption");
    displayDiv.appendChild(movieOptionDiv);
    // Poster container
    let posterDiv = document.createElement('div');
    posterDiv.setAttribute('class', "poster");
    movieOptionDiv.appendChild(posterDiv);
    // Info container
    let infoDiv = document.createElement('div');
    infoDiv.setAttribute('class', "info");
    movieOptionDiv.appendChild(infoDiv);

    // Movie poster
    let poster = document.createElement('img');
    poster.setAttribute('src', baseImageUrl + movies[selection].poster_path);
    poster.style.width = "250px";
    posterDiv.appendChild(poster);
    // Movie title
    let title = document.createElement('h2');
    title.textContent = movies[selection].title;
    title.style.color = '#FFF';
    title.style.textShadow = '1px 1px 1px #000';
    infoDiv.appendChild(title);
    // Movie description
    let description = document.createElement('p');
    description.style.fontSize = '18px';
    description.textContent = movies[selection].overview;
    infoDiv.appendChild(description);
    // Movie tagline (uses movie details endpoint)
    let quote = document.createElement('p');
    (tagline[selection]) ? quote.textContent = tagline[selection]: quote.style.marginBottom = '18px';
    quote.style.fontSize = '18px';
    quote.style.color = 'yellow';
    quote.style.textAlign = 'center';
    quote.style.fontStyle = 'italic';
    infoDiv.appendChild(quote);
    // Movie language (uses movie details endpoint)
    if (language[selection] !== null) {
      let spoken = document.createElement('p');
      spoken.innerHTML = `Language: <span>${language[selection]}</span>`;
      spoken.style.backgroundColor = 'orange';
      infoDiv.appendChild(spoken);
    }
    // Movie runtime (uses movie details endpoint)
    let runtime = document.createElement('p');
    runtime.innerHTML = `Runtime: <span>${runtimes[selection]} mins.</span>`;
    infoDiv.appendChild(runtime);
    // Movie release date
    let releaseDate = document.createElement('p');
    releaseDate.innerHTML = `Release Date: <span>${movies[selection].release_date}</span>`;
    infoDiv.appendChild(releaseDate);
    }
}

// Register event listener  ===================================================
movieBtn.addEventListener('click', getDiscoverMovie);
