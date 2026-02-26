import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { getTodos } from "@/lib/actions";
import TodoApp from "../../components/TodoApp";

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  const todos = await getTodos();

  return (
    <main className="min-h-screen bg-background">
      <TodoApp
        initialTodos={todos}
        userName={session!.user?.name || "User"}
      />
    </main>
  );
}