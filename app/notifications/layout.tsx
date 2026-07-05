import { redirect } from "next/navigation"
import { getUserRole } from "@/app/auth/actions"

export default async function NotificationsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const role = await getUserRole()

    if (role !== "admin") {
        redirect("/")
    }

    return <>{children}</>
}
