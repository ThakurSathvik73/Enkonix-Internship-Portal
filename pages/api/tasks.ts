import { connectDB } from "@/data/database/mangodb";
import type { NextApiRequest, NextApiResponse } from "next";

type Task = {
  _id?: string;
  title: string;
  description: string;
  course: string;
  createdBy: string; // Admin email
  assignedTo?: string; // Faculty email
  assignedStudents?: string[]; // Student emails
  dueDate: string;
  status: "created" | "assigned" | "in-progress" | "completed";
  createdAt: Date;
};

let tasks: Task[] = [];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    

    if (req.method === "GET") {
      const { role, email } = req.query;
      
      let filteredTasks = tasks;
      
      if (role === "Admin") {
        // Admin sees all tasks
        filteredTasks = tasks;
      } else if (role === "Faculty") {
        // Faculty sees tasks assigned to them
        filteredTasks = tasks.filter((t) => t.assignedTo === email);
      } else if (role === "Student") {
        // Students see tasks assigned to them
        filteredTasks = tasks.filter((t) => 
          t.assignedStudents?.includes(email as string)
        );
      }

      return res.status(200).json({ success: true, tasks: filteredTasks });
    }

    if (req.method === "POST") {
      const { title, description, course, createdBy, dueDate } = req.body;

      if (!title || !course || !createdBy) {
        return res.status(400).json({ error: "Title, course, and createdBy are required" });
      }

      const newTask: Task = {
        title,
        description: description || "",
        course,
        createdBy,
        dueDate: dueDate || new Date().toISOString(),
        status: "created",
        createdAt: new Date(),
      };

      tasks.push(newTask);
      return res.status(201).json({ success: true, task: newTask });
    }

    if (req.method === "PUT") {
      const { id, assignedTo, assignedStudents, status } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Task ID is required" });
      }

      const taskIndex = tasks.findIndex((t) => t._id === id);
      if (taskIndex === -1) {
        return res.status(404).json({ error: "Task not found" });
      }

      if (assignedTo !== undefined) {
        tasks[taskIndex].assignedTo = assignedTo;
        tasks[taskIndex].status = "assigned";
      }

      if (assignedStudents !== undefined) {
        tasks[taskIndex].assignedStudents = assignedStudents;
        tasks[taskIndex].status = "in-progress";
      }

      if (status !== undefined) {
        tasks[taskIndex].status = status;
      }

      return res.status(200).json({ success: true, task: tasks[taskIndex] });
    }

    if (req.method === "DELETE") {
      const { id } = req.body;
      if (!id) {
        return res.status(400).json({ error: "Task ID is required" });
      }
      tasks = tasks.filter((t) => t._id !== id);
      return res.status(200).json({ success: true, message: "Task deleted" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error handling task request:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

