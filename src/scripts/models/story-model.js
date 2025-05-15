import {
  getStories,
  getStoryDetail,
  addStory,
  addStoryGuest,
} from "../data/api";

import { saveStory, getAllStories, deleteStory } from '../data/idb';

class StoryModel {
  static async getStories() {
    try{
      const stories = await getStories();
      for (const story of stories) {
        await saveStory(story);
      }
      return stories;
    } catch (error) {
      return getAllStories();
    }
  }

  static async getStoryDetail(id) {
    return getStoryDetail(id);
  }

  static async addStory(storyData) {
    return addStory(storyData);
  }

  static async addStoryGuest(storyData) {
    return addStoryGuest(storyData);
  }

  static async deleteStory(id) {
    await deleteStory(id);
    return await getAllStories();
  }
}

export default StoryModel;
