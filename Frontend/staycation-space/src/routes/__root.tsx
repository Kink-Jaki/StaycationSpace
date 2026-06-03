import { Outlet, createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => (
    <>
      <nav style={{ display: 'flex', gap: '1rem' }}>
        <h5>Halaman Login</h5>
      </nav>

      <hr />

      <Outlet />
    </>
  ),
})