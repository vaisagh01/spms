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
    (<Sidebar collapsible="icon" {...props}>
      <SidebarHeader></SidebarHeader>
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
