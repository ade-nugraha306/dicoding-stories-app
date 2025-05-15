import StoryModel from "../../models/story-model";
import AuthModel from "../../models/auth-model";

export default class HomePagePresenter {
  constructor(view) {
    this.view = view;
    this.isOffline = !navigator.onLine;
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      console.log('Online status changed: ONLINE');
      this.isOffline = false;
      this.refreshContent();
    });
    
    window.addEventListener('offline', () => {
      console.log('Online status changed: OFFLINE');
      this.isOffline = true;
      this.refreshContent();
    });
  }

  async refreshContent() {
    try {
      const stories = await StoryModel.getStories();
      this.view.displayStories(stories, this.isOffline);
      
      // Only try to initialize map if online
      if (!this.isOffline) {
        this.initializeMapWithStories(stories);
      } else {
        console.log('Offline mode: Skipping map initialization');
        this.view.showOfflineMapMessage();
      }
    } catch (error) {
      console.error("Error refreshing content:", error);
    }
  }

  async init() {
    try {
      const isLoggedIn = AuthModel.isUserLoggedIn();
      this.view.updateLoginLink(isLoggedIn);

      const stories = await StoryModel.getStories();
      
      // Only initialize map if online
      if (!this.isOffline) {
        this.initializeMapWithStories(stories);
      } else {
        console.log('Offline mode: Skipping map initialization');
        this.view.showOfflineMapMessage();
      }
      
      this.view.displayStories(stories, this.isOffline);
    } catch (error) {
      console.error("Error in HomePagePresenter:", error);
    }
  }
  
  initializeMapWithStories(stories) {
    try {
      this.view.initializeMap();
      
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
      console.error("Error initializing map:", error);
    }
  }
  
  async handleDelete(id) {
    try {
      const stories = await StoryModel.deleteStory(id);
      this.view.displayStories(stories, this.isOffline);
      
      // Update map after delete if online
      if (!this.isOffline) {
        this.initializeMapWithStories(stories);
      }
    } catch (error) {
      console.error("Error deleting story:", error);
    }
  }
}
