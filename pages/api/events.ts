import calenderevents from "@/data/models/calenderevents";
import { connectDB } from "@/data/database/mangodb";
import type { NextApiRequest, NextApiResponse } from "next";

type CalendarEvent = {
  title: string;
  date: string;
  time?: string;
  meatingLink?: string;
  color: "yellow" | "green" | "red" | "purple";
  assignedTo?: string[];
};

// In-memory storage (replace with actual database)
let events: CalendarEvent[] = [];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    await connectDB();
  } catch (err) {
    console.error("DB connect error:", err);
    return res.status(500).json({ error: "Database connection failed" });
  }
  if (req.method === "GET") {
    // Fetch all events
    events = await calenderevents.find();
    return res.status(200).json(events);
  }

  if (req.method === "POST") {
    // Create new event
    const { title, date, time, meatingLink, color, assignedTo } = req.body;

    if (!title || !date) {
      return res.status(400).json({ error: "Title and date are required" });
    }
    const newEvent = await calenderevents.create({
      title,
      date,
      time,
      meatingLink,
      color,
      assignedTo: assignedTo || [],
    });
    return res.status(201).json(newEvent);
  }

  if (req.method === "DELETE") {
    // Delete event
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Event ID is required" });
    }
    await calenderevents.findByIdAndDelete(id);

    return res.status(200).json({ message: "Event deleted successfully" });
  }

  return res.status(405).json({ error: "Method not allowed" });
}

