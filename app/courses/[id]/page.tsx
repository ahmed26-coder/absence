import { use } from "react"
import CourseDetailsPageClient from "./client-page"

interface CourseDetailsPageProps {
  params: Promise<{ id: string }>
}

export default async function CourseDetailsPage({ params }: CourseDetailsPageProps) {
  const { id } = await params
  return <CourseDetailsPageClient courseId={id} />
}
