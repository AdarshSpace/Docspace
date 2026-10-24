
import { connection } from "next/server";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import WorkspaceHeader from "@/component/workspaceHeader";
import { getAuthenticatedUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/DB";
import User from "@/model/user";


export default async function DashboardContent({
  children,
}: {
  children: ReactNode;
}) {
  await connection();

  const authUser = await getAuthenticatedUser();

  if (!authUser) {
    redirect("/login");
  }

  await connectToDatabase();

  const user = await User.findById(authUser.userId)
    .select("email")
    .lean();

  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <WorkspaceHeader email={user.email} />
      {children}
    </>
  );
}
