import DetailPagePresenter from "../../presenter/stories-presenter/detail-presenter";

let map;

export default class DetailStoryPage {
  constructor() {
    this.presenter = new DetailPagePresenter(this);
  }

  async render() {
    return `
      <section class="container">
        <a href="#/" class="back-button">Back</a>
        <h1 id="story-title">Loading...</h1>
        <img id="story-image" alt="Story Image" style="max-width:100%; margin-bottom:20px;" />
        <p id="story-description"></p>
        <p id="story-created-at"></p>
        <p id="story-location"></p>
        <div id="map" style="height: 400px; margin-top: 20px;"></div> 
      </section>
    `;
  }

  async afterRender() {
    const id = window.location.hash.split("/")[2]; // Dapatkan ID dari URL
    this.presenter.init(id); // Panggil presenter untuk load data
  }

  displayStory(story) {
    document.getElementById("story-title").innerText = story.name;
    document.getElementById("story-image").src = story.photoUrl;
    document.getElementById("story-description").innerText = story.description;
    document.getElementById("story-created-at").innerText = `Created At: ${new Date(story.createdAt).toLocaleString()}`;
    document.getElementById("story-location").innerText = `Location: ${story.lat}, ${story.lon}`;
  }

  initializeMap(lat, lon, title, description, photoUrl) {
    if (map) {
      map.remove();
      map = null;
    }

    if (!window.L) {
      console.error("Leaflet library not loaded!");
      return;
    }

    map = L.map("map").setView([lat, lon], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const marker = L.marker([lat, lon]).addTo(map);
    const popupContent = `
      <div style="text-align: center;">
        <img src="${photoUrl}" alt="${title}" style="width: 100px; height: auto; margin-bottom: 5px;" />
        <h3>${title}</h3>
        <p>${description}</p>
      </div>
    `;
    marker.bindPopup(popupContent).openPopup();
  }
}
