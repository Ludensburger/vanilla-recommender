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
          "dubstep",
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
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      // Get selected genres
      const selectedGenres = Array.from(form.elements["genres"])
        .filter((checkbox) => checkbox.checked)
        .map((checkbox) => checkbox.value);

      // Dispatch the custom event with the selected genres
      const eventDetail = { detail: selectedGenres };
      const genresSelectedEvent = new CustomEvent(
        "genresSelected",
        eventDetail
      );
      window.dispatchEvent(genresSelectedEvent);
    });
  });
});
