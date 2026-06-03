import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/beranda')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello ini beranda</div>
}
