import extraStep from "./modKey.js";

// API
const baseUrl = 'https://api.themoviedb.org/3';
const requestKey = `?api_key=${extraStep}`;
const langSuffix = '&language=en-US'; // Not needed as English is the default
const genresPath = '/genre/movie/list';

// DOM
const genreDropdown = document.getElementById('genresList');

// GET genre list from API  ===================================================
const getGenres = async () => {
  const endpoint = baseUrl + genresPath + requestKey;
  try {
    let response = await fetch(endpoint);
    if (response.ok) {
      let jsonResponse = await response.json();
      console.log(jsonResponse);                                               // TEST
      let genres = jsonResponse.genres;
      console.log(genres);                                                     // TEST
      return genres;
    }
    
  } catch (error) {
    console.log(error);
  }
}

// Display genres in dropdown  ================================================
const displayGenres = (genresArr) => {
  console.log("Param:", genresArr);                                        //TEST
  for (let genreObj of genresArr) {
    let option = document.createElement('option');
    option.value = genreObj.id;
    console.log(genreObj.name);                                                //TEST
    option.text = genreObj.name;
    genreDropdown.appendChild(option);
  }
}

// TEST       ====        ====        ====        ====        ====        ==== TESTING
getGenres().then(displayGenres);
