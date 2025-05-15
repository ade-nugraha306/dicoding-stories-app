import AddStoryPresenter from "../../presenter/stories-presenter/add-story-presenter";

export default class AddStoryPage {
  constructor() {
    this.presenter = new AddStoryPresenter(this);
    this.capturedPhotoBlob = null;
  }

  async render() {
    return `
      <section class="container">
        <h1>Tambah Story</h1>
        <form id="add-story-form">
          <label for="description">Deskripsi:</label><br />
          <textarea id="description" placeholder="Deskripsi" required></textarea>

          <div>
            <p>Ambil Foto dari Kamera:</p>
            <video id="camera-stream" autoplay width="300"></video>
            <button type="button" id="capture-btn">Ambil Foto</button>
            <canvas id="snapshot-canvas" style="display:none;"></canvas>
          </div>

          <div>
            <label for="photo">Upload Gambar:</label>
            <input type="file" id="photo" name="photo" accept="image/*" />
          </div>

          <div id="map" style="height: 300px; margin-top: 1rem;"></div>

          <div>
            <label for="lat">Latitude (optional):</label>
            <input type="number" id="lat" step="any" />
          </div>
          <div>
            <label for="lon">Longitude (optional):</label>
            <input type="number" id="lon" step="any" />
          </div>

          <button type="submit">Submit</button>
        </form>
      </section>
    `;
  }

  async afterRender() {
    await this.presenter.init();

    const map = L.map("map").setView([-6.2, 106.8], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    let marker = null;

    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      document.getElementById("lat").value = lat.toFixed(6);
      document.getElementById("lon").value = lng.toFixed(6);

      if (marker) {
        marker.setLatLng([lat, lng]);
      } else {
        marker = L.marker([lat, lng]).addTo(map);
      }

      marker
        .bindPopup(`Lat: ${lat.toFixed(6)}, Lon: ${lng.toFixed(6)}`)
        .openPopup();
    });
  }

  addCaptureButtonListener(listener) {
    document.getElementById("capture-btn").addEventListener("click", listener);
  }

  addFormSubmitListener(listener) {
    document
      .getElementById("add-story-form")
      .addEventListener("submit", listener);
  }

  async capturePhoto() {
    const video = document.getElementById("camera-stream");
    const canvas = document.getElementById("snapshot-canvas");
    const context = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          this.capturedPhotoBlob = blob;
          resolve(blob);
        },
        "image/jpeg",
        0.8
      );
    });
  }

  getFormData() {
    const description = document.getElementById("description").value.trim();
    const lat = document.getElementById("lat").value || undefined;
    const lon = document.getElementById("lon").value || undefined;
    const photoInput = document.getElementById("photo");

    const photo =
      this.capturedPhotoBlob ||
      (photoInput.files.length > 0 ? photoInput.files[0] : null);

    return {
      description,
      lat: lat ? parseFloat(lat) : undefined,
      lon: lon ? parseFloat(lon) : undefined,
      photo,
    };
  }
  displayCapturedPhoto(blob) {
    const video = document.getElementById("camera-stream");
    const canvas = document.getElementById("snapshot-canvas");
    const context = canvas.getContext("2d");

    // Convert blob to image and draw to canvas
    const imageUrl = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      context.drawImage(image, 0, 0);
      URL.revokeObjectURL(imageUrl);
    };
    image.src = imageUrl;

    // Hide video, show canvas
    video.style.display = "none";
    canvas.style.display = "block";

    const captureBtn = document.getElementById("capture-btn");
    if (captureBtn) captureBtn.disabled = true;
  }
}
