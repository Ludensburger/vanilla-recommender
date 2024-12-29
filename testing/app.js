let data = {};

async function loadData() {
  const response = await fetch("data.json");
  data = await response.json();
  populateUserDropdown();
}

function populateUserDropdown() {
  const userSelect = document.getElementById("users");
  Object.keys(data.users).forEach((user) => {
    const option = document.createElement("option");
    option.value = user;
    option.textContent = user;
    userSelect.appendChild(option);
  });

  // Show recommendations for the first user by default
  userSelect.addEventListener("change", () =>
    showRecommendations(userSelect.value)
  );
  showRecommendations(userSelect.value);
}

function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, val, idx) => sum + val * vecB[idx], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val ** 2, 0));
  return dotProduct / (magnitudeA * magnitudeB || 1);
}

function showRecommendations(user) {
  const targetRatings = Object.values(data.users[user]).map((r) => r || 0);
  const similarities = Object.entries(data.users).map(
    ([otherUser, ratings]) => {
      if (otherUser === user) return [otherUser, 0];
      const otherRatings = Object.values(ratings).map((r) => r || 0);
      return [otherUser, cosineSimilarity(targetRatings, otherRatings)];
    }
  );

  // Sort by similarity and get recommendations
  similarities.sort((a, b) => b[1] - a[1]);
  const topSimilarUser = similarities[0][0];
  const topUserRatings = data.users[topSimilarUser];
  const recommendations = Object.entries(topUserRatings)
    .filter(([genre, rating]) => rating && !data.users[user][genre])
    .sort((a, b) => b[1] - a[1]);

  // Update UI
  const recommendedGenres = document.getElementById("recommended-genres");
  recommendedGenres.innerHTML = "";
  recommendations.forEach(([genre]) => {
    const li = document.createElement("li");
    li.textContent = genre;
    recommendedGenres.appendChild(li);
  });

  // Map genres to artists
  const recommendedArtists = document.getElementById("recommended-artists");
  recommendedArtists.innerHTML = "";
  recommendations.forEach(([genre]) => {
    if (data.genres[genre]) {
      data.genres[genre].forEach((artist) => {
        const li = document.createElement("li");
        li.textContent = artist;
        recommendedArtists.appendChild(li);
      });
    }
  });
}

loadData();

const coldStartSongs = [
  { song: "Bohemian Rhapsody", genre: "rock" },
  { song: "Blinding Lights", genre: "pop" },
  { song: "Take Five", genre: "jazz" },
  { song: "Fur Elise", genre: "classical" },
  { song: "Hotel California", genre: "rock" },
];

let userRatings = {};

function startColdStart() {
  const songList = document.getElementById("song-rating-list");
  coldStartSongs.forEach(({ song }, index) => {
    const div = document.createElement("div");
    div.className = "song-item";
    div.innerHTML = `
        <label>${song}</label>
        <input type="number" id="rating-${index}" min="1" max="5" step="1" placeholder="Rate 1-5">
      `;
    songList.appendChild(div);
  });

  document.getElementById("submit-ratings").addEventListener("click", () => {
    collectRatings();
    generateInitialRecommendations();
  });
}

function collectRatings() {
  coldStartSongs.forEach(({ genre }, index) => {
    const rating =
      parseInt(document.getElementById(`rating-${index}`).value, 10) || 0;
    userRatings[genre] = (userRatings[genre] || 0) + rating;
  });
}

function generateInitialRecommendations() {
  // Use the initial user ratings to find recommendations
  const targetRatings = Object.values(userRatings).map((r) => r || 0);
  const similarities = Object.entries(data.users).map(
    ([otherUser, ratings]) => {
      const otherRatings = Object.values(ratings).map((r) => r || 0);
      return [otherUser, cosineSimilarity(targetRatings, otherRatings)];
    }
  );

  // Sort and get recommendations
  similarities.sort((a, b) => b[1] - a[1]);
  const topSimilarUser = similarities[0][0];
  const topUserRatings = data.users[topSimilarUser];
  const recommendations = Object.entries(topUserRatings)
    .filter(([genre, rating]) => rating && !userRatings[genre])
    .sort((a, b) => b[1] - a[1]);

  // Update UI
  const recommendedGenres = document.getElementById("recommended-genres");
  recommendedGenres.innerHTML = "";
  recommendations.forEach(([genre]) => {
    const li = document.createElement("li");
    li.textContent = genre;
    recommendedGenres.appendChild(li);
  });

  // Map genres to artists
  const recommendedArtists = document.getElementById("recommended-artists");
  recommendedArtists.innerHTML = "";
  recommendations.forEach(([genre]) => {
    if (data.genres[genre]) {
      data.genres[genre].forEach((artist) => {
        const li = document.createElement("li");
        li.textContent = artist;
        recommendedArtists.appendChild(li);
      });
    }
  });

  // Show recommendations section
  document.getElementById("cold-start").style.display = "none";
  document.getElementById("recommendations").style.display = "block";
}

startColdStart();
