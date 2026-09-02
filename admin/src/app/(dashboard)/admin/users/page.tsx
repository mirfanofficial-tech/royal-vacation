import { redirect } from "next/navigation";

export default function UsersIndexPage() {
  redirect("/admin/users/admins");
}
