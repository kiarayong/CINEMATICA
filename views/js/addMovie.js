
$("#addMovieForm").on("submit",addmovie);
async function addmovie(e) {
    e.preventDefault();
    let data = new FormData(e.target);
    let registerEntries = Object.fromEntries(data.entries());
    let response = await fetch("/api/movies?token="+sessionStorage.token, {
        method: "post",
        body: JSON.stringify(registerEntries),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    if (response.ok) {
        let data = await response.json();
        $("#statusMessage").html(data.message);
    } else {
        let err = await response.json();
        $("#statusMessage").text(err.message);
    }
}