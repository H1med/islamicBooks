import { createClient } from "@/lib/supabase/server";
import { Catalog } from "@/components/catalog";
import type { Book } from "@/types/database";

export default async function Home() {
  const supabase = await createClient();

  const { data: books } = await supabase
    .from("books")
    .select("*")
    .eq("status", "published")
    .order("title");

  const bookList = (books || []) as Book[];

  const publishers = Array.from(
    new Set(bookList.map((b) => b.publisher_name).filter(Boolean) as string[]),
  ).sort((a, b) => a.localeCompare(b, "de"));

  const years = Array.from(
    new Set(bookList.map((b) => b.year).filter(Boolean) as string[]),
  ).sort((a, b) => b.localeCompare(a));

  return (
    <Catalog
      initialBooks={bookList}
      publishers={publishers}
      years={years}
    />
  );
}