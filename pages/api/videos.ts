import { connectDB } from "@/data/database/mangodb";
import type { NextApiRequest, NextApiResponse } from "next";

type Video = {
  _id?: string;
  title: string;
  videoLink: string;
  course: string;
  description?: string;
  createdBy: string;
  createdAt: Date;
};

// In-memory storage (replace with database model)
let videos: Video[] = [];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    

    if (req.method === "GET") {
      return res.status(200).json({ success: true, videos });
    }

    if (req.method === "POST") {
      const { title, videoLink, course, description, createdBy } = req.body;

      if (!title || !videoLink || !course) {
        return res.status(400).json({ error: "Title, video link, and course are required" });
      }

      const newVideo: Video = {
        title,
        videoLink,
        course,
        description,
        createdBy,
        createdAt: new Date(),
      };

      videos.push(newVideo);
      return res.status(201).json({ success: true, video: newVideo });
    }

    if (req.method === "DELETE") {
      const { id } = req.body;
      if (!id) {
        return res.status(400).json({ error: "Video ID is required" });
      }
      videos = videos.filter((v) => v._id !== id);
      return res.status(200).json({ success: true, message: "Video deleted" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error handling video request:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

