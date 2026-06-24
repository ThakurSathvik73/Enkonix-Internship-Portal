import calenderevents from "@/data/models/calenderevents";
import { connectDB } from "@/data/database/mangodb";
import type { NextApiRequest, NextApiResponse } from "next";

type CalendarEvent = {
  id?: string;
  title: string;
  date: string;
  time?: string;
  meatingLink?: string;
  color: "yellow" | "green" | "red" | "purple";
  assignedTo?: string[];
};

const normalizeEvent = (event: any): CalendarEvent => ({
  id: event._id?.toString?.() ?? event.id?.toString?.(),
  title: event.title,
  date: event.date,
  time: event.time,
  meatingLink: Array.isArray(event.meatingLink)
    ? event.meatingLink[0]
    : event.meatingLink,
  color: event.color,
  assignedTo: event.assignedTo || [],
});

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
    const events = await calenderevents.find().lean();
    return res.status(200).json(events.map(normalizeEvent));
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
      meatingLink: Array.isArray(meatingLink) ? meatingLink[0] : meatingLink,
      color,
      assignedTo: assignedTo || [],
    });
    return res.status(201).json(normalizeEvent(newEvent));
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
