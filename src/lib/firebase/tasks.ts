import { collection, addDoc, updateDoc, doc, getDocs, query, where, Timestamp, deleteDoc } from "firebase/firestore";
import { db } from "./client";

export type TaskStatus = "todo" | "completed";

export interface Task {
  id?: string;
  title: string;
  description: string;
  points: number;
  assignedTo: string | null;
  createdBy: string;
  householdId: string;
  status: TaskStatus;
  createdAt: any;
  dueDate?: string;
}

export interface TaskTemplate {
  id?: string;
  title: string;
  description: string;
  points: number;
  householdId: string;
  createdBy: string;
}

export async function createTask(task: Omit<Task, "id" | "createdAt" | "status">) {
  const tasksRef = collection(db, "tasks");
  const docRef = await addDoc(tasksRef, {
    ...task,
    status: "todo",
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

import { updateUserPoints } from "./users";

export async function updateTaskStatus(taskId: string, status: TaskStatus, points?: number, userId?: string) {
  const taskRef = doc(db, "tasks", taskId);
  await updateDoc(taskRef, { status });

  if (points && userId) {
    const pointsDiff = status === "completed" ? points : -points;
    await updateUserPoints(userId, pointsDiff);
  }
}

export async function updateTask(taskId: string, updates: Partial<Omit<Task, "id" | "createdAt" | "householdId" | "createdBy">>) {
  const taskRef = doc(db, "tasks", taskId);
  await updateDoc(taskRef, updates);
}

export async function deleteTask(taskId: string) {
  const taskRef = doc(db, "tasks", taskId);
  await deleteDoc(taskRef);
}

export async function getHouseholdTasks(householdId: string) {
  const q = query(collection(db, "tasks"), where("householdId", "==", householdId));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
}

export async function getTaskTemplates(householdId: string) {
  const q = query(collection(db, "taskTemplates"), where("householdId", "==", householdId));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as TaskTemplate));
}

export async function createTaskTemplate(template: Omit<TaskTemplate, "id">) {
  const templatesRef = collection(db, "taskTemplates");
  const docRef = await addDoc(templatesRef, template);
  return docRef.id;
}
