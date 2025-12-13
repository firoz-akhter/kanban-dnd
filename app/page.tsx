import Board from "@/components/Board";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <h2 className="bg-red-300 px-4">Hello</h2>
      <Board />
    </div>
  );
}
