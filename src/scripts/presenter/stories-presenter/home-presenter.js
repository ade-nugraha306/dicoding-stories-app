import StoryModel from "../../models/story-model";
import AuthModel from "../../models/auth-model";

export default class HomePagePresenter {
  constructor(view) {
    this.view = view;
  }

  async init() {
    try {
      const isLoggedIn = AuthModel.isUserLoggedIn();
      this.view.updateLoginLink(isLoggedIn);

      const stories = await StoryModel.getStories();
      this.view.initializeMap();
      this.view.displayStories(stories);

      stories.forEach((story) => {
        if (story.lat && story.lon) {
          this.view.addMapMarker(
            story.lat,
            story.lon,
            story.name,
            story.description,
            story.photoUrl
          );
        }
      });
    } catch (error) {
      console.error("Error in HomePagePresenter:", error);
    }
  }
  async handleDelete(id) {
    const stories = await StoryModel.deleteStory(id);
    this.view.displayStories(stories);
  }
}
