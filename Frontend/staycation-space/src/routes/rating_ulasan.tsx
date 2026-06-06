import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/rating_ulasan')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/rating_ulasan"!</div>
}
