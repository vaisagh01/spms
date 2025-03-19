import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

export function AppSidebar({data, ...props}) {

  return (
    (<Sidebar className="" collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex item-center justify-start">
                  <img src="/1png.png" className="h-11 m-1" alt=""/>
                  <img src="/22png.png" className="h-8 m-2" alt=""/>
                </div>
      </SidebarHeader>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarContent>
        <NavMain items={data} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>)
  );
}
