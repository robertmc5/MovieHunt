import extraStep from "./modKey.js";

// TMDB API
const baseUrl = 'https://api.themoviedb.org/3';
const requestKey = `?api_key=${extraStep}`;
const genresPath = '/genre/movie/list';
const discoverMoviePath = '/discover/movie';
const withGenres = '&with_genres=';
const onPage = '&page=';
const nowPlayingPath = '/movie/now_playing';
const popularPath = '/movie/popular';
const topRatedPath = '/movie/top_rated';
const baseImageUrl = 'https://image.tmdb.org/t/p/w500';
const movieDetailsPath = '/movie/';
const creditsPath = '/credits';
const videosPath = '/videos';
// Video stream is an iframe from YouTube
const baseVideoEmbed = 'https://www.youtube.com/embed/';

// Counter of current movie page being displayed
let currentPage = 1;
// Record of current genre being displayed
let displayedGenre;

// DOM
const genreDropdown = document.getElementById('genresList');
const chooseDiv = document.getElementById('choose');
const movieBtn = document.getElementsByClassName('movie-btn')[0];
const previousBtn = document.getElementById('previous-btn');
const nextBtn = document.getElementById('next-btn');
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
  } catch (error) {
    console.log(error);
    genreDropdown.removeChild(genreDropdown.lastElementChild);
    let message = document.createElement('option');
    message.text = "ERROR: GENRES UNAVAILABLE";
    genreDropdown.style.fontSize = "1.125rem";
    genreDropdown.style.padding = "0.5rem";
    genreDropdown.style.fontWeight = "bold";
    genreDropdown.appendChild(message);
  }
}

// Activate 'Pick a genre' dropdown
getGenres().then(displayGenres);

// Display genres in dropdown  ================================================
function displayGenres(genresArr) {
  for (let genreObj of genresArr) {
    let option = document.createElement('option');
    option.value = genreObj.id;
    option.text = genreObj.name;
    genreDropdown.appendChild(option);
  }
  displayedGenre = genreDropdown.value;
  console.log("displayedGenre:", displayedGenre);                              // TEST
}

// GET movie from API  ========================================================
// Helper Fn to retrieve current genre
const selectedGenre = () => {
  let selectedGenreId = genreDropdown.value;
  return selectedGenreId;
}
// Helper Fn to display error to user if needed
function renderError(error, div) {
  while (div.firstChild) {
    div.removeChild(div.firstChild);
  }
  let errorMessage = document.createElement('p');
  errorMessage.textContent = error;
  errorMessage.style.fontSize = "1.125rem";
  errorMessage.style.padding = "0.5rem";
  errorMessage.style.fontWeight = "bold";
  div.appendChild(errorMessage);
}
// Helper Fn to not include older movies in Now Playing list
const removeOlderDates = (movies, minimumDate) => {
  let newerMovies = [];
  console.log("movies.slice():", newerMovies);                                 // TEST
  for (let each = 0; each < movies.length; each++) {
    console.log("movies[each].release_date:", movies[each].release_date);                                 // TEST
    console.log("minimumDate:", minimumDate);                                 // TEST
    if (movies[each].release_date >= minimumDate) {
      newerMovies.push(movies[each]);
    }
  }
  console.log("newerMovies.splice(each, 1):", newerMovies);                    // TEST
  return newerMovies;
}

// Twenty movies discovered with selected genre and page number
const getDiscoverMovie = async () => {
  let category = selectedGenre();
  let endpoint = '';
  switch (category) {
    case 'now_playing':
      endpoint = baseUrl + nowPlayingPath + requestKey + onPage + currentPage;
      break;
    case 'popular':
      endpoint = baseUrl + popularPath + requestKey + onPage + currentPage;
      break;
    case 'top_rated':
      endpoint = baseUrl + topRatedPath + requestKey + onPage + currentPage;
      break;
    default:
      endpoint = baseUrl + discoverMoviePath + requestKey + withGenres + category + onPage + currentPage;
  }
  try {
    let response = await fetch(endpoint);
    console.log("DISCOVER MOVIE ENDPOINT:", endpoint);                    // TEST
    if (response.ok) {
      let jsonResponse = await response.json();
      console.log("DISCOVER MOVIE OBJECT:", jsonResponse);                    // TEST
      // The results property array of objects includes poster_path, title, overview, release_date & id
      let movies = jsonResponse.results;
      if (category === 'now_playing') {
        movies = removeOlderDates(movies, jsonResponse.dates.minimum);
      }
      console.log("DISCOVER MOVIE RESULTS PROPERTY array of objects:", movies); // TEST
      console.log("This is PAGE:", currentPage); // TEST
      // Collect tagline, language & runtimes of the twenty movies in details API
      // Collect the {first five} cast of the movies in credits API
      // Organize them in 20 element arrays that match the index of the movies array
      let tagline = [];
      let language = [];
      let runtimes = [];
      let cast = [];
      for (let each = 0; each < movies.length; each++) {
        let concurrentArray = await Promise.all([getMovieDetails(movies[each].id), getMovieCredits(movies[each].id)]);
        tagline.push(concurrentArray[0].tagline);
        runtimes.push(concurrentArray[0].runtime);
        language.push((concurrentArray[0].original_language === "en") ? null: (concurrentArray[0].spoken_languages.length === 0) ? null: (concurrentArray[0].spoken_languages[0].english_name === "English") ? "Dubbed English": concurrentArray[0].spoken_languages[0].english_name);
        cast.push(concurrentArray[1]);
      }
      console.log("runtimes:", runtimes);                                      // TEST
      console.log("tagline:", tagline);                                        // TEST
      console.log("language:", language);                                      // TEST
      console.log("cast:", cast);                                              // TEST
      // Call for the twenty movies info to be displayed
      displayMovie(movies, tagline, runtimes, language, cast);
    }
  } catch (error) {
    console.log(error);
    renderError("ERROR: DATA UNAVAILABLE", displayDiv)
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
    console.log(error);
  }
}

// GET movie credits from API  ================================================
async function getMovieCredits(movieId) {
  const endpoint = baseUrl + movieDetailsPath + movieId + creditsPath + requestKey;
  console.log("Credits endpoint:", endpoint);                                      // TEST
  try {
    let response = await fetch(endpoint);
    if (response.ok) {
      let creditsObj = await response.json();
      console.log("creditsObj:", creditsObj);                              // TEST
      let cast = creditsObj.cast
      let topCast = 'Cast: ';
      if (cast.length === 0) {
        return null;
      } else if (cast.length === 1) {
        return topCast + cast[0].name + '.';
      } else if (cast.length === 2) {
        return topCast + cast[0].name + ' and ' + cast[1].name + '.';
      }
      let stop = Math.min(5, cast.length);
      for (let i = 0; i < (stop-1); i++) {
        topCast += (i !== (stop-2)) ? cast[i].name + ', ': cast[i].name + ' and ' + cast[i+1].name + '.';
      }
      return topCast;
    }
  } catch (error) {
    console.log(error);
  }
}

// GET movie trailer from API  ================================================   TODO
async function getMovieTrailer(event) {
  let current = event.currentTarget;
  console.log("event.currentTarget:", current);                                      // TEST
  let movieId = current.getAttribute('data-key');
  console.log("current.getAttribute('data-key'):", movieId);                         // TEST
  const endpoint = baseUrl + movieDetailsPath + movieId + videosPath + requestKey;    // TODO Path
  console.log("Videos endpoint:", endpoint);                                      // TEST
  try {
    let response = await fetch(endpoint);
    if (response.ok) {
      let videosObj = await response.json();
      console.log("videosObj:", videosObj);                              // TEST
      let resultsArr = videosObj.results;
      console.log("resultsArr:", resultsArr);                              // TEST
      if (resultsArr.length === 0) throw new Error(`Request failed. Status: ${response.status};`);
      let officialTrailerObj = '';
      let trailerObj = '';
      let videoObj = '';
      resultsArr.forEach((obj) => {
        if (obj.name.toLowerCase() === "official trailer") {
          officialTrailerObj = obj;
        } else if (obj.name.toUpperCase().includes("TRAILER")) {
          trailerObj = obj;
        } else if (obj.name) {
          videoObj = obj;
        }
      });
      if (!officialTrailerObj) {
        officialTrailerObj = (trailerObj) ? trailerObj: videoObj;
      }
      let source = baseVideoEmbed + officialTrailerObj.key;
      console.log("source:", source);                                          // TEST
      let trailer = document.createElement('iframe');
      trailer.setAttribute('title', officialTrailerObj.name);
      trailer.setAttribute('src', source);
      trailer.setAttribute('frameborder', "0");
      trailer.setAttribute('allow', "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
      trailer.setAttribute('allowfullscreen', "true");
      if (current.parentNode.lastElementChild === current) {
        current.parentNode.appendChild(trailer);
      } else {
        current.parentNode.removeChild(current.parentNode.lastElementChild);
      }
    }
  } catch (error) {
    console.log(error);
    let errorMessage = document.createElement('p');
    errorMessage.textContent = "ERROR: VIDEO NOT AVAILABLE";
    errorMessage.style.fontSize = "1.125rem";
    errorMessage.style.padding = "0.5rem";
    errorMessage.style.fontWeight = "bold";
    if (current.parentNode.lastElementChild === current) {
      current.parentNode.appendChild(errorMessage);
    } else {
      current.parentNode.removeChild(current.parentNode.lastElementChild);
    }
  }
}

// Pre-display movie info  ====================================================
function displayProcessing() {
  // Check for genre change
  let currentGenre = genreDropdown.value;
  if (currentGenre !== displayedGenre) {
    currentPage = 1;
    displayedGenre = currentGenre;
    previousBtn.style.display = 'none';
  }
  // Clear out display
  while (displayDiv.firstChild) {
    displayDiv.removeChild(displayDiv.firstChild);
  }
  // Display that it is processing ...
  let processingDiv = document.createElement('div');
  processingDiv.textContent = "Processing...";
  processingDiv.style.fontSize = "1.125rem";
  processingDiv.style.padding = "0.5rem";
  processingDiv.style.color = "gray";
  processingDiv.style.fontWeight = "bold";
  displayDiv.appendChild(processingDiv);
  // Show group buttons
  if (currentPage < 1000) nextBtn.style.display = 'block';
  if (currentPage > 1) previousBtn.style.display = 'block';
  movieBtn.style.fontSize = '0.875rem';
  // Invoke Movie fetch
  getDiscoverMovie();
}

function previousPage() {
  if (currentPage <= 2) {
    previousBtn.style.display = 'none';
  }
  if (currentPage !== 1) {
    currentPage--;
  }
  displayProcessing()
}

function nextPage() {
  if (currentPage >= 999) {
    nextBtn.style.display = 'none';
  }
  if (currentPage !== 1000) {
    currentPage++;
  }
  displayProcessing()
}

// Display movie info  ========================================================
function displayMovie(movies, tagline, runtimes, language, cast) {
  // Clear out processing display
  displayDiv.removeChild(displayDiv.firstChild);
  // Display group of twenty movies
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
    quote.style.fontWeight = '600';
    infoDiv.appendChild(quote);
    // Movie language (uses movie details endpoint)
    if (language[selection] !== null) {
      let spoken = document.createElement('p');
      spoken.innerHTML = `Language: <span>${language[selection]}</span>`;
      spoken.style.backgroundColor = 'gold';
      infoDiv.appendChild(spoken);
    }
    // Movie runtime (uses movie details endpoint)
    let runtime = document.createElement('p');
    if (runtimes[selection] !== 0) runtime.innerHTML = `Runtime: <span>${runtimes[selection]} mins.</span>`;
    infoDiv.appendChild(runtime);
    // Movie release date
    let releaseDate = document.createElement('p');
    releaseDate.innerHTML = `Release Date: <span>${movies[selection].release_date}</span>`;
    infoDiv.appendChild(releaseDate);
    // Movie cast (uses movie credits endpoint)
    let topFiveCast = document.createElement('p');
    topFiveCast.textContent = cast[selection];
    infoDiv.appendChild(topFiveCast);
    // Movie trailer button (doesn't use API until clicked on)
    let trailerBtn = document.createElement('button');
    trailerBtn.setAttribute('class', "movie-btn trailer-btn");
    trailerBtn.setAttribute('type', "button");
    trailerBtn.textContent = "Movie Trailer";
    trailerBtn.style.fontSize = "0.8125rem";
    trailerBtn.style.padding = "0.25rem 0.5rem";
    trailerBtn.style.margin = "0.5rem 0 0.8125rem";
    trailerBtn.setAttribute('data-key', movies[selection].id);
    infoDiv.appendChild(trailerBtn);
  }
  // Register event listeners on the trailer buttons
  const trailerBtns = Array.from(document.getElementsByClassName('trailer-btn'));
  console.log("trailerBtns:", trailerBtns);                                // TEST
  trailerBtns.forEach((trailerBtn) => {
    trailerBtn.addEventListener('click', getMovieTrailer);
  });
}

// Register event listeners  ==================================================
movieBtn.addEventListener('click', displayProcessing);
previousBtn.addEventListener('click', previousPage);
nextBtn.addEventListener('click', nextPage);
