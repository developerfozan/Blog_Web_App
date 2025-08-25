import conf from "../conf/conf.js";
import { Client, Databases, Storage, ID } from "appwrite";

export class Service {
  client = new Client();
  databases;
  bucket;

  constructor() {
    this.client
      .setEndpoint(conf.appwriteUrl)
      .setProject(conf.appwriteProjectId);
    this.databases = new Databases(this.client);
    this.bucket = new Storage(this.client);
  }

  async createPost({ title, slug, content, featuredImage, status, userId }) {
    try {
      return await this.databases.createDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        slug,
        { title, content, featuredImage, status, userId }
      );
    } catch (error) {
      console.error("createPost error", error);
      throw error;
    }
  }

  async updatePost(id, data) {
    try {
      return await this.databases.updateDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        id,
        data
      );
    } catch (error) {
      console.error("updatePost error", error);
      throw error;
    }
  }

  async deletePost(id) {
    try {
      await this.databases.deleteDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        id
      );
      return true;
    } catch (error) {
      console.error("deletePost error", error);
      throw error;
    }
  }

  async getPost(id) {
    try {
      return await this.databases.getDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        id
      );
    } catch (error) {
      console.error("getPost error", error);
      throw error;
    }
  }

  async listPosts(queries = []) {
    try {
      return await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        queries
      );
    } catch (error) {
      console.error("listPosts error", error);
      throw error;
    }
  }

  async uploadFile(file) {
    try {
      return await this.bucket.createFile(
        conf.appwriteBucketId,
        ID.unique(),
        file
      );
    } catch (error) {
      console.error("uploadFile error", error);
      throw error;
    }
  }

  async deleteFile(fileId) {
    try {
      await this.bucket.deleteFile(conf.appwriteBucketId, fileId);
      return true;
    } catch (error) {
      console.error("deleteFile error", error);
      throw error;
    }
  }

  //this is my code.
  // async getFilePreviewURL(fileId) {
  //   try {
  //     if (!fileId) {
  //       console.warn("No fileId provided to getFilePreviewURL");
  //       return null;
  //     }

  //     // Get file preview - this should return a URL string
  //     const previewUrl = this.bucket.getFilePreview(
  //       conf.appwriteBucketId,
  //       fileId
  //     );

  //     return previewUrl;
  //   } catch (error) {
  //     console.error("getFilePreviewURL error:", error);
  //     console.error("File ID that caused error:", fileId);
  //     return null;
  //   }
  // }

  //this is chatGPT code.
  async getFilePreviewURL(fileId) {
    try {
      if (!fileId) {
        console.warn("No fileId provided to getFilePreviewURL");
        return null;
      }

      // Use getFileView for public access
      return this.bucket.getFileView(conf.appwriteBucketId, fileId);
    } catch (error) {
      console.error("getFilePreviewURL error:", error);
      return null;
    }
  }

  // Additional method to get file view (public URL)
  async getFileViewURL(fileId) {
    try {
      if (!fileId) return null;

      const viewUrl = this.bucket.getFileView(conf.appwriteBucketId, fileId);

      return viewUrl;
    } catch (error) {
      console.error("getFileViewURL error:", error);
      return null;
    }
  }
}

const appwriteService = new Service();
export default appwriteService;
