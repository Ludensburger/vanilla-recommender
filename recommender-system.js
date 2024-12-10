document.addEventListener("DOMContentLoaded", async () => {
  console.log("Recommender System Loaded");

  // Listen for the custom event and handle the selected genres
  window.addEventListener("genresSelected", async (event) => {
    const selectedGenres = event.detail;
    console.log("Received genres in recommender-system.js:", selectedGenres);

    // Fetch users data from users1.json
    try {
      const response = await fetch("users1.json");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const users = await response.json();
      console.log("Fetched users:", users); // Debugging statement

      // Convert selected genres to a format compatible with the recommendArtists function
      const newUserGenres = selectedGenres.reduce((acc, genre) => {
        acc[genre] = 1;
        return acc;
      }, {});

      console.log("New user genres:", newUserGenres); // Debugging statement

      // Get artist recommendations
      const recommendedArtists = recommendArtists(newUserGenres, users);
      console.log("Recommended artists:", recommendedArtists);

      // Display the recommended artists
      document.querySelector(".r1").textContent =
        recommendedArtists[0] || "N/A";
      document.querySelector(".r2").textContent =
        recommendedArtists[1] || "N/A";
      document.querySelector(".r3").textContent =
        recommendedArtists[2] || "N/A";
      document.querySelector(".r4").textContent =
        recommendedArtists[3] || "N/A";
      document.querySelector(".r5").textContent =
        recommendedArtists[4] || "N/A";
    } catch (error) {
      console.error("Error fetching users data:", error);
      document.querySelector(".r1").textContent = "Error";
      document.querySelector(".r2").textContent = "Error";
      document.querySelector(".r3").textContent = "Error";
      document.querySelector(".r4").textContent = "Error";
      document.querySelector(".r5").textContent = "Error";
    }
  });
});

function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((acc, val, idx) => acc + val * vecB[idx], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
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
  console.log("All genres:", allGenres); // Debugging statement
  const similarUsers = findSimilarUsers(newUserGenres, users, allGenres).slice(
    0,
    k
  );
  console.log("Similar users:", similarUsers); // Debugging statement

  const artistScores = {};
  similarUsers.forEach(({ user, similarity }) => {
    user.artists.forEach((artist) => {
      if (!artistScores[artist]) {
        artistScores[artist] = 0;
      }
      artistScores[artist] += similarity;
    });
  });

  console.log("Artist scores:", artistScores); // Debugging statement

  return Object.entries(artistScores)
    .sort((a, b) => b[1] - a[1])
    .map(([artist]) => artist);
}
