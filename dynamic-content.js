document.addEventListener("DOMContentLoaded", function () {
  const recommendMeButton = document.getElementById("recommendMe");
  const dynamicContent = document.getElementById("dynamic-content");

  recommendMeButton.addEventListener("click", function () {
    // Clear the main content
    dynamicContent.innerHTML = "";

    // Load the form
    const formHTML = `
      <form id="genreForm">
        <table class="genre-table">
          <tr>
            <th colspan="4">Select Music Genres</th>
          </tr>
          <tr>
            <td><input type="checkbox" name="genres" value="acoustic" /> Acoustic</td>
            <td><input type="checkbox" name="genres" value="alt-rock" /> Alt Rock</td>
            <td><input type="checkbox" name="genres" value="alternative" /> Alternative</td>
            <td><input type="checkbox" name="genres" value="ambient" /> Ambient</td>
          </tr>
          <tr>
            <td><input type="checkbox" name="genres" value="black-metal" /> Black Metal</td>
            <td><input type="checkbox" name="genres" value="blues" /> Blues</td>
            <td><input type="checkbox" name="genres" value="bossanova" /> Bossa Nova</td>
            <td><input type="checkbox" name="genres" value="classical" /> Classical</td>
          </tr>
          <tr>
            <td><input type="checkbox" name="genres" value="country" /> Country</td>
            <td><input type="checkbox" name="genres" value="dance" /> Dance</td>
            <td><input type="checkbox" name="genres" value="death-metal" /> Death Metal</td>
            <td><input type="checkbox" name="genres" value="deep-house" /> Deep House</td>
          </tr>
          <tr>
            <td><input type="checkbox" name="genres" value="disco" /> Disco</td>
            <td><input type="checkbox" name="genres" value="dubstep" /> Dubstep</td>
            <td><input type="checkbox" name="genres" value="edm" /> EDM</td>
            <td><input type="checkbox" name="genres" value="electro" /> Electro</td>
          </tr>
          <tr>
            <td><input type="checkbox" name="genres" value="electronic" /> Electronic</td>
            <td><input type="checkbox" name="genres" value="emo" /> Emo</td>
            <td><input type="checkbox" name="genres" value="folk" /> Folk</td>
            <td><input type="checkbox" name="genres" value="funk" /> Funk</td>
          </tr>
          <tr>
            <td><input type="checkbox" name="genres" value="goth" /> Goth</td>
            <td><input type="checkbox" name="genres" value="grindcore" /> Grindcore</td>
            <td><input type="checkbox" name="genres" value="groove" /> Groove</td>
            <td><input type="checkbox" name="genres" value="grunge" /> Grunge</td>
          </tr>
          <tr>
            <td><input type="checkbox" name="genres" value="guitar" /> Guitar</td>
            <td><input type="checkbox" name="genres" value="hard-rock" /> Hard Rock</td>
            <td><input type="checkbox" name="genres" value="hardcore" /> Hardcore</td>
            <td><input type="checkbox" name="genres" value="heavy-metal" /> Heavy Metal</td>
          </tr>
          <tr>
            <td><input type="checkbox" name="genres" value="hip-hop" /> Hip Hop</td>
            <td><input type="checkbox" name="genres" value="house" /> House</td>
            <td><input type="checkbox" name="genres" value="indie" /> Indie</td>
            <td><input type="checkbox" name="genres" value="indie-pop" /> Indie Pop</td>
          </tr>
          <tr>
            <td><input type="checkbox" name="genres" value="j-pop" /> J-Pop</td>
            <td><input type="checkbox" name="genres" value="j-rock" /> J-Rock</td>
            <td><input type="checkbox" name="genres" value="jazz" /> Jazz</td>
            <td><input type="checkbox" name="genres" value="k-pop" /> K-Pop</td>
          </tr>
          <tr>
            <td><input type="checkbox" name="genres" value="metal" /> Metal</td>
            <td><input type="checkbox" name="genres" value="metalcore" /> Metalcore</td>
            <td><input type="checkbox" name="genres" value="movies" /> Movies</td>
            <td><input type="checkbox" name="genres" value="philippines-opm" /> Philippines OPM</td>
          </tr>
          <tr>
            <td><input type="checkbox" name="genres" value="piano" /> Piano</td>
            <td><input type="checkbox" name="genres" value="pop" /> Pop</td>
            <td><input type="checkbox" name="genres" value="progressive-house" /> Progressive House</td>
            <td><input type="checkbox" name="genres" value="punk" /> Punk</td>
          </tr>
          <tr>
            <td><input type="checkbox" name="genres" value="punk-rock" /> Punk Rock</td>
            <td><input type="checkbox" name="genres" value="r-n-b" /> R&B</td>
            <td><input type="checkbox" name="genres" value="reggae" /> Reggae</td>
            <td><input type="checkbox" name="genres" value="road-trip" /> Road Trip</td>
          </tr>
        </table>
        <div class="genre-prompt-container">
          <button type="submit">Submit</button>
          <button type="reset">Clear</button>
          <p class="selection-counter">0</p>
        </div>
      </form>
    `;
    dynamicContent.innerHTML = formHTML;

    // Handle form submission
    const genreForm = document.getElementById("genreForm");
    genreForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      // Get selected genres
      const selectedGenres = Array.from(genreForm.elements["genres"])
        .filter((checkbox) => checkbox.checked)
        .map((checkbox) => checkbox.value);

      // Fetch recommended artists based on selected genres
      const recommendedArtists = await getRecommendedArtists(selectedGenres);

      // Update the main content with recommended artists
      dynamicContent.innerHTML = `

      

        <h2>Recommended Artists</h2>
        <div class="grid">
          ${recommendedArtists
            .map((artist) => `<div class="card">${artist}</div>`)
            .join("")}
        </div>
      `;
    });
  });

  async function getRecommendedArtists(genres) {
    console.log("Recommender System Loaded");

    const response = await fetch("./users1.json");
    const users = await response.json();

    function cosineSimilarity(vecA, vecB) {
      const dotProduct = vecA.reduce(
        (acc, val, idx) => acc + val * vecB[idx],
        0
      );
      const magnitudeA = Math.sqrt(
        vecA.reduce((acc, val) => acc + val * val, 0)
      );
      const magnitudeB = Math.sqrt(
        vecB.reduce((acc, val) => acc + val * val, 0)
      );
      return dotProduct / (magnitudeA * magnitudeB);
    }

    function getUserGenreVector(user, allGenres) {
      return allGenres.map((genre) => user.genres[genre] || 0);
    }

    function getAllGenres(users) {
      const genres = new Set();
      users.forEach((user) => {
        Object.keys(user.genres).forEach((genre) => genres.add(genre));
      });
      return Array.from(genres);
    }

    function findSimilarUsers(newUserGenres, users, allGenres) {
      const newUserVector = allGenres.map((genre) => newUserGenres[genre] || 0);
      return users
        .map((user) => {
          const userVector = getUserGenreVector(user, allGenres);
          const similarity = cosineSimilarity(newUserVector, userVector);
          return { user, similarity };
        })
        .sort((a, b) => b.similarity - a.similarity);
    }

    function recommendArtists(newUserGenres, users, k = 5) {
      const allGenres = getAllGenres(users);
      const similarUsers = findSimilarUsers(
        newUserGenres,
        users,
        allGenres
      ).slice(0, k);

      const artistScores = {};
      similarUsers.forEach(({ user, similarity }) => {
        user.artists.forEach((artist) => {
          if (!artistScores[artist]) {
            artistScores[artist] = 0;
          }
          artistScores[artist] += similarity;
        });
      });

      return Object.entries(artistScores)
        .sort((a, b) => b[1] - a[1])
        .map(([artist]) => artist);
    }

    const newUserGenres = genres.reduce((acc, genre) => {
      acc[genre] = 1;
      return acc;
    }, {});

    return recommendArtists(newUserGenres, users);
  }
});
