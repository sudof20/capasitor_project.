import { createFileRoute } from "@tanstack/react-router";
import { CapacitorLab } from "@/lab/CapacitorLab";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <CapacitorLab />;
}
