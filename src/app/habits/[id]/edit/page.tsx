import { HabitEditor } from "@/components/habit-editor";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <HabitEditor id={id} />;
}
