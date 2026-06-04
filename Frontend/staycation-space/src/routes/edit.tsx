import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/edit')({
  component: EditPage,
})

function EditPage() {
  return <div>Hello ini halaman edit</div>
}
