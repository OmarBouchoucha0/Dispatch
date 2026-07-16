import { redirect } from "next/navigation"

export default function LogsRedirect() {
  redirect("/files?view=logs")
}
