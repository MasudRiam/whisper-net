import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-5xl font-bold">404</h1>
      <p className="text-muted-foreground">
        The page you are looking for does not exist.
      </p>
      <Button asChild>
        <Link href="/">Go home</Link>
      </Button>
    </main>
  );
}
