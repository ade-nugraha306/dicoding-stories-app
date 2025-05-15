import StoryModel from "../../models/story-model";

export default class DetailPagePresenter {
  constructor(view) {
    this.view = view;
  }

  async init(id) {
    try {
      const story = await StoryModel.getStoryDetail(id); // Ambil detail story
      this.view.displayStory(story); // Kirimkan data ke view
      this.view.initializeMap(story.lat, story.lon, story.name, story.description, story.photoUrl); // Inisialisasi map
    } catch (error) {
      console.error("Error fetching story detail:", error);
    }
  }
}
