document.addEventListener("DOMContentLoaded", function () {
  const recommendMeButton = document.getElementById("recommendMe");
  const dynamicContent = document.getElementById("dynamic-content");

  recommendMeButton.addEventListener("click", function () {
    // Clear the main content
    dynamicContent.innerHTML = "";

    // Create the form
    const form = document.createElement("form");
    form.id = "genreForm";

    const table = document.createElement("table");
    table.className = "genre-table";

    const genres = [
      {
        category: "Popular Genres",
        items: [
          "pop",
          "rock",
          "hip-hop",
          "r-n-b",
          "country",
          "electronic",
          "house",
          "techno",
          "trance",
          "dubstep",
          "drum-and-bass",
        ],
      },
      {
        category: "Classical/Traditional",
        items: ["classical", "jazz", "blues", "folk", "gospel"],
      },
      {
        category: "Metal and Rock Subgenres",
        items: ["metal", "hard-rock", "punk", "alternative-rock", "metalcore"],
      },
      {
        category: "Cultural/Regional",
        items: ["reggae", "bossa-nova", "latin", "k-pop", "j-pop"],
      },
      {
        category: "Other Contemporary",
        items: ["indie", "emo", "dance", "ambient", "funk"],
      },
    ];

    genres.forEach((genreGroup) => {
      const headerRow = document.createElement("tr");
      const headerCell = document.createElement("th");
      headerCell.colSpan = 4;
      headerCell.textContent = genreGroup.category;
      headerRow.appendChild(headerCell);
      table.appendChild(headerRow);

      const genreRows = [];
      genreGroup.items.forEach((genre, index) => {
        if (index % 4 === 0) {
          genreRows.push(document.createElement("tr"));
        }
        const cell = document.createElement("td");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.name = "genres";
        checkbox.value = genre;
        cell.appendChild(checkbox);
        cell.appendChild(
          document.createTextNode(
            ` ${
              genre.charAt(0).toUpperCase() + genre.slice(1).replace(/-/g, " ")
            }`
          )
        );
        genreRows[genreRows.length - 1].appendChild(cell);
      });
      genreRows.forEach((row) => table.appendChild(row));
    });

    form.appendChild(table);

    const genrePromptContainer = document.createElement("div");
    genrePromptContainer.className = "genre-prompt-container";

    const submitButton = document.createElement("button");
    submitButton.type = "submit";
    submitButton.textContent = "Submit";
    genrePromptContainer.appendChild(submitButton);

    const resetButton = document.createElement("button");
    resetButton.type = "reset";
    resetButton.textContent = "Clear";
    genrePromptContainer.appendChild(resetButton);

    const selectionCounter = document.createElement("p");
    selectionCounter.className = "selection-counter";
    selectionCounter.textContent = "0";
    genrePromptContainer.appendChild(selectionCounter);

    form.appendChild(genrePromptContainer);
    dynamicContent.appendChild(form);

    // Handle form submission
    form.addEventListener("submit", async function (formEvent) {
      formEvent.preventDefault();
      // Get selected genres
      const selectedGenres = Array.from(form.elements["genres"])
        .filter((checkbox) => checkbox.checked)
        .map((checkbox) => checkbox.value);

      console.log("Selected genres:", selectedGenres); // Debugging statement

      // Store selected genres in localStorage
      const userRatings = selectedGenres.map((genre) => ({ genre, rating: 1 }));
      localStorage.setItem("userRatings", JSON.stringify(userRatings));

      // Dispatch the custom event with selected genres
      const genresEvent = new CustomEvent("genresSelected", {
        detail: selectedGenres,
      });
      window.dispatchEvent(genresEvent);
    });
  });

  window.addEventListener("genresSelected", async (genresEvent) => {
    const selectedGenres = genresEvent.detail;
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
      displayRecommendedArtists(recommendedArtists);
    } catch (error) {
      console.error("Error fetching users data:", error);
      displayRecommendedArtists(["Error", "Error", "Error", "Error", "Error"]);
    }
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
    const similarUsers = findSimilarUsers(
      newUserGenres,
      users,
      allGenres
    ).slice(0, k);
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

  function displayRecommendedArtists(artists) {
    const section = document.querySelector("#recommended-section");
    if (section) {
      const grid = section.querySelector(".grid");
      if (grid) {
        artists.forEach((artist, index) => {
          const element = grid.querySelector(`.r${index + 1}`);
          if (element) {
            element.textContent = artist;
          }
        });
      }
    }
  }
});
