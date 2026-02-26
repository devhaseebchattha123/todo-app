"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { createTodo, toggleTodo, deleteTodo } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Moon, Sun, LogOut } from "lucide-react";

type Todo = {
  id: string;
  title: string;
  completed: boolean;
};

const todoSchema = z.object({
  title: z.string().min(1, "Todo khaali nahi ho sakta").max(100),
});

type TodoForm = z.infer<typeof todoSchema>;

export default function TodoApp({
  initialTodos,
  userName,
}: {
  initialTodos: Todo[];
  userName: string;
}) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const { theme, setTheme } = useTheme();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TodoForm>({
    resolver: zodResolver(todoSchema),
  });

  const createMutation = useMutation({
    mutationFn: (title: string) => createTodo(title),
    onSuccess: () => {
      window.location.reload();
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      toggleTodo(id, completed),
    onMutate: ({ id, completed }) => {
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed } : t))
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTodo(id),
    onMutate: (id) => {
      setTodos((prev) => prev.filter((t) => t.id !== id));
    },
  });

  const onSubmit = (data: TodoForm) => {
    createMutation.mutate(data.title);
    reset();
  };

  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 mt-4">
        <div>
          <h1 className="text-3xl font-bold">My Todos</h1>
          <p className="text-muted-foreground">Welcome, {userName}!</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </Button>
          <Button
            variant="outline"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Stats */}
      <Card className="mb-6">
        <CardContent className="pt-4">
          <p className="text-sm text-muted-foreground">
            {completedCount} / {todos.length} completed
          </p>
        </CardContent>
      </Card>

      {/* Add Todo Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add New Todo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Write your todo here..."
                {...register("title")}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Adding..." : "Add"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Todos List */}
      <Card>
        <CardHeader>
          <CardTitle>Todos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {todos.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              NO Todos Found. Add some todos to get started!
            </p>
          ) : (
            todos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <Checkbox
                  checked={todo.completed}
                  onCheckedChange={(checked) =>
                    toggleMutation.mutate({
                      id: todo.id,
                      completed: checked as boolean,
                    })
                  }
                />
                <span
                  className={`flex-1 ${
                    todo.completed
                      ? "line-through text-muted-foreground"
                      : ""
                  }`}
                >
                  {todo.title}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => deleteMutation.mutate(todo.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}