import { revalidatePath } from "next/cache";

/** Bust cached homepage data after admin edits. */
export function revalidatePublicSite() {
  revalidatePath("/");
}
