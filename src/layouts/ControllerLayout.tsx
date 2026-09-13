import { useState } from "react"
import { Outlet } from "react-router-dom"
import ControllerHeader from "../components/controller/ControllerHeader"
import ControllerSidebar from "../components/controller/ControllerSidebar"

function ControllerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-[#031426] text-white">
      <div className="flex min-h-screen">
        <ControllerSidebar
          open={sidebarOpen}
          collapsed={sidebarCollapsed}
          onClose={() => setSidebarOpen(false)}
          onToggleCollapse={() =>
            setSidebarCollapsed((current) => !current)
          }
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <ControllerHeader
            onMenuClick={() => setSidebarOpen(true)}
          />

          <main className="min-w-0 flex-1 overflow-auto bg-[#031426]">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

export default ControllerLayout