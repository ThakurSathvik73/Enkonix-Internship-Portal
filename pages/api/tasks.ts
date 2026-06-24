import { requireRoles } from "@/utils/apiAuth";
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
    const currentUser = requireRoles(req, res, ["Superadmin", "Admin", "Faculty", "Student"]);
    if (!currentUser) return;

    if (req.method === "GET") {
      let filteredTasks = tasks;
      
      if (currentUser.role === "Superadmin" || currentUser.role === "Admin") {
        filteredTasks = tasks;
      } else if (currentUser.role === "Faculty") {
        filteredTasks = tasks.filter((t) => t.assignedTo === currentUser.email);
      } else if (currentUser.role === "Student") {
        filteredTasks = tasks.filter((t) => 
          t.assignedStudents?.includes(currentUser.email)
        );
      }

      return res.status(200).json({ success: true, tasks: filteredTasks });
    }

    if (req.method === "POST") {
      if (!requireRoles(req, res, ["Superadmin", "Admin"])) return;

      const { title, description, course, dueDate } = req.body;

      if (!title || !course) {
        return res.status(400).json({ error: "Title and course are required" });
      }

      const newTask: Task = {
        title,
        description: description || "",
        course,
        createdBy: currentUser.email,
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
        if (!requireRoles(req, res, ["Superadmin", "Admin"])) return;
        tasks[taskIndex].assignedTo = assignedTo;
        tasks[taskIndex].status = "assigned";
      }

      if (assignedStudents !== undefined) {
        if (!requireRoles(req, res, ["Superadmin", "Admin", "Faculty"])) return;
        if (
          currentUser.role === "Faculty" &&
          tasks[taskIndex].assignedTo !== currentUser.email
        ) {
          return res.status(403).json({ error: "Faculty can only assign their own tasks" });
        }
        tasks[taskIndex].assignedStudents = assignedStudents;
        tasks[taskIndex].status = "in-progress";
      }

      if (status !== undefined) {
        if (
          currentUser.role === "Student" &&
          !tasks[taskIndex].assignedStudents?.includes(currentUser.email)
        ) {
          return res.status(403).json({ error: "Students can only update their own assigned tasks" });
        }
        tasks[taskIndex].status = status;
      }

      return res.status(200).json({ success: true, task: tasks[taskIndex] });
    }

    if (req.method === "DELETE") {
      if (!requireRoles(req, res, ["Superadmin", "Admin"])) return;

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
