$(document).ready(async function () {
    // Function to create a new playlist
    $("#createPlaylistForm").submit(async function (event) {
        event.preventDefault();
        const playlistName = $("#playlistName").val();

        if (playlistName) {
            try {
                const response = await fetch(`/api/playlist/create?token=${sessionStorage.token}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ playlistName })
                });

                if (response.ok) {
                    alert(`${playlistName} playlist has been created`);
                    location.reload();
                } else {
                    const err = await response.json();
                    alert(err.message);
                }
            } catch (error) {
                console.error(error);
                alert("An error occurred while creating the playlist");
            }
        }
    });

    // Load existing playlists
    try {
        const response = await fetch(`/api/playlists?token=${sessionStorage.token}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            const playlists = await response.json();

            if (!playlists || playlists.length === 0) {
                $(".playlists").append("<p>No playlists available.</p>");
            } else {
                playlists.forEach(async playlist => {
                    let playlistDetails = `<div class="playlist">
                                             <h3>${playlist.name}</h3>`;

                    if (playlist.movies.length === 0) {
                        playlistDetails += "<p>No movies in this playlist.</p>";
                    } else {
                        playlistDetails += "<ul>";
                        for (const movieId of playlist.movies) {
                            const movieResponse = await fetch(`/api/movies/${movieId}`);
                            if (movieResponse.ok) {
                                const movieData = await movieResponse.json();
                                playlistDetails += `
                                                            <li>
                                                                <article class="article">
                                                                    <h2>${movieData.title}</h2>
                                                                    <div>
                                                                        <img src="${movieData.image}" alt="${movieData.title} Image">
                                                                        <p class="description">${movieData.description}</p>
                                                                        <button class="delete-movie" data-movie-id="${movieId}" data-playlist-id="${playlist._id}">Delete Movie</button>
                                                                    </div>
                                                                </article>
                                                                </li>  `;
                            } else {
                                const err = await movieResponse.json();
                                console.error("Error:", err);
                            }
                        }
                        playlistDetails += "</ul>";
                    }
                    playlistDetails += `<button class="delete-playlist" data-playlist-id="${playlist._id}">Delete Playlist</button></div>`;

                    $(".playlists").append(playlistDetails);
                });
            }
        } else {
            const err = await response.json();
            console.error("Error:", err);
            alert(err.message);
        }
    } catch (error) {
        console.error(error);
        alert("An error occurred while loading playlists");
    }

    // Delete playlist button click event
    $(".playlists").on("click", ".delete-playlist", async function () {
        const playlistId = $(this).data("playlist-id");

        try {
            const response = await fetch(`/api/playlists/${playlistId}?token=${sessionStorage.token}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (response.ok) {
                // Playlist deleted successfully
                $(this).closest(".playlist").remove();
                alert("Playlist deleted successfully");
            } else {
                const err = await response.json();
                alert(err.message);
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred while deleting the playlist");
        }
    }); $(".playlists").on("click", ".delete-playlist", async function () {
        const playlistId = $(this).data("playlist-id");

        try {
            const response = await fetch(`/api/playlists/${playlistId}?token=${sessionStorage.token}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (response.ok) {
                // Playlist deleted successfully
                $(this).closest(".playlist").remove();
                alert("Playlist deleted successfully");
            } else {
                const err = await response.json();
                alert(err.message);
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred while deleting the playlist");
        }
    });
});
$(".playlists").on("click", ".delete-movie", async function () {
    const playlistId = $(this).data("playlist-id");
    const movieId = $(this).data("movie-id");

    console.log("Deleting movie:", movieId, "from playlist:", playlistId);

    try {
        const response = await fetch(`/api/playlists/${playlistId}/removeMovie/${movieId}?token=${sessionStorage.token}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        });

        console.log("Server response:", response);

        if (response.ok) {
            // Movie removed from playlist successfully
            $(this).closest("li").remove();
            alert("Movie removed from playlist successfully");
        } else {
            const err = await response.json();
            alert(err.message);
        }
    } catch (error) {
        console.error(error);
        alert("An error occurred while removing the movie from the playlist");
    }
});

