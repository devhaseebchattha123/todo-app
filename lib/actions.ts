"use server";

import { getServerSession } from "next-auth";
import { prisma } from "./prisma";
import { revalidatePath } from "next/cache";

export async function getTodos() {
  const session = await getServerSession();
  if (!session?.user?.email) return [];

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) return [];

  return prisma.todo.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function createTodo(title: string) {
  const session = await getServerSession();
  if (!session?.user?.email) throw new Error("Not authenticated");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) throw new Error("User not found");

  await prisma.todo.create({
    data: { title, userId: user.id },
  });

  revalidatePath("/dashboard");
}

export async function toggleTodo(id: string, completed: boolean) {
  const session = await getServerSession();
  if (!session?.user?.email) throw new Error("Not authenticated");

  await prisma.todo.update({
    where: { id },
    data: { completed },
  });

  revalidatePath("/dashboard");
}

export async function deleteTodo(id: string) {
  const session = await getServerSession();
  if (!session?.user?.email) throw new Error("Not authenticated");

  await prisma.todo.delete({ where: { id } });
  revalidatePath("/dashboard");
}

export async function registerUser(
  name: string,
  email: string,
  password: string
) {
  const bcrypt = await import("bcryptjs");
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new Error("Email already exists");

  await prisma.user.create({
    data: { name, email, password: hashedPassword },
  });
}
