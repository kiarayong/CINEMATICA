
//using the axios library to make the GET request to 
//fetch search results from the server. Axios simplifies handling asynchronous 
//operations and managing the HTTP response.
$(async function () {
    let playlists = [];

    // Fetch user's playlists using axios
    try {
        const response = await axios.get(`/api/playlists?token=${sessionStorage.token}`);
        playlists = response.data;
    } catch (error) {
        window.location.href = '/login';

    }

    // Fetch movies and render them with dropdowns using axios
    try {
        const moviesResponse = await axios.get("/api/movies");
        const moviesData = moviesResponse.data;

        moviesData.forEach(function (movie) {
            $(".movies").append(`
                <article class="article">
                    <h2>${movie.title}</h2>
                    <div>
                        <img src="${movie.image}" alt="${movie.title} Image">
                        <p class="description">${movie.description}</p>
                        <p class="cinema">Cinema: ${movie.cinema.name} (${movie.cinema.location})</p>
                        <div class="playlist-dropdown">
                            <select class="playlist-select">
                                <option value="" disabled selected>Select a playlist</option>
                                ${playlists.map(playlist => `<option value="${playlist._id}">${playlist.name}</option>`).join('')}
                            </select>
                            <button class="add-to-playlist" data-movie-id="${movie._id}">Add to Playlist</button>
                        </div>
                    </div>
                </article>
            `);
        });
    } catch (error) {
        console.error(error);
        alert("An error occurred while loading movies");
    }

    $(".movies").on("click", ".add-to-playlist", async function () {
        const movieId = $(this).data("movie-id");
        const playlistId = $(this).closest(".playlist-dropdown").find(".playlist-select").val();

        if (!playlistId) {
            alert("Please select a playlist first.");
            return;
        }

        try {
            await axios.post(`/api/playlist/${playlistId}/addMovie?token=${sessionStorage.token}`, {
                movieId: movieId
            });

            alert("Movie added to playlist successfully");
        } catch (error) {
            console.error(error);
            alert("An error occurred while adding the movie to the playlist");
        }
    });

    document.getElementById('searchForm').addEventListener('submit', async (event) => {
        event.preventDefault();

        const searchQuery = document.getElementById('searchQuery').value.trim();

        if (searchQuery === '') {
            alert('Please enter a search query');
            return;
        }

        try {
            const response = await axios.get(`/api/movies?title=${encodeURIComponent(searchQuery)}`);
            const searchResults = response.data;
            displaySearchResults(searchResults);
        } catch (error) {
            console.error(error);
            alert('An error occurred while searching for movies');
        }
    });

    function displaySearchResults(results) {
        const moviesSection = document.querySelector('.movies');
        moviesSection.innerHTML = '';

        results.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.classList.add('movie-card');
            movieCard.innerHTML = `
                <article class="article">
                    <h2>${movie.title}</h2>
                    <div>
                        <img src="${movie.image}" alt="${movie.title} Image">
                        <p class="description">${movie.description}</p>
                        <div class="playlist-dropdown">
                            <select class="playlist-select">
                                <option value="" disabled selected>Select a playlist</option>
                                ${playlists.map(playlist => `<option value="${playlist._id}">${playlist.name}</option>`).join('')}
                            </select>
                            <button class="add-to-playlist" data-movie-id="${movie._id}">Add to Playlist</button>
                        </div>
                    </div>
                </article>
            `;
            moviesSection.appendChild(movieCard);
        });
    }
});
