document.addEventListener("DOMContentLoaded", function () {
  const recommendButton = document.querySelector("#recommendMe");
  recommendButton.addEventListener("click", function () {
    const userRatings = JSON.parse(localStorage.getItem("userRatings"));
    console.log("User Ratings:", userRatings); // Debugging statement

    if (userRatings) {
      fetch("users1.json")
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((users) => {
          console.log("Fetched Users:", users); // Debugging statement
          const recommendations = getRecommendations(userRatings, users);
          console.log("Recommendations:", recommendations); // Debugging statement
          updateRecommendations(recommendations);
        })
        .catch((error) => {
          console.error("Error fetching users data:", error);
        });
    } else {
      console.log("No user ratings found.");
    }
  });

  function getRecommendations(userRatings, users) {
    const userRatingsArray = Object.values(userRatings).map((r) => r || 0);
    const similarities = users.map((user) => {
      const userGenresArray = Object.values(user.genres).map((r) => r || 0);
      const similarity = cosineSimilarity(userRatingsArray, userGenresArray);
      return { user: user.name, similarity: similarity, artists: user.artists };
    });

    similarities.sort((a, b) => b.similarity - a.similarity);

    const recommendedArtists = [];
    similarities.forEach((similarUser) => {
      similarUser.artists.forEach((artist) => {
        if (!recommendedArtists.includes(artist)) {
          recommendedArtists.push(artist);
        }
      });
    });

    return recommendedArtists.slice(0, 5);
  }

  function cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((acc, val, idx) => acc + val * vecB[idx], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  function updateRecommendations(recommendations) {
    recommendations.forEach((artist, index) => {
      const element = document.querySelector(`.r${index + 1}`);
      if (element) {
        element.textContent = artist;
      }
    });
  }
});
