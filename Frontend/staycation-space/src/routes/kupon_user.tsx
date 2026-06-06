import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/kupon_user')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello ini halaman kupon user</div>
}
