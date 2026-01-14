import { Label } from "@/components/ui/label";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { BookCheck, Home, PlusSquare } from "lucide-react";
import Link from "next/link";
import DiscussSidebarUserSection from "./DiscussSidebarUserSection";

export default async function DiscussSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Discuss</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/discussion">
                  <SidebarMenuButton>
                    <Home />
                    <Label>Home</Label>
                  </SidebarMenuButton>
                </Link>

                <Link href="/discussion/add-discussion">
                  <SidebarMenuButton>
                    <PlusSquare />
                    <Label>Add Discussion</Label>
                  </SidebarMenuButton>
                </Link>

                <Link href="/discussion/my-discussions">
                  <SidebarMenuButton>
                    <BookCheck />
                    <Label>My Discussions</Label>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <DiscussSidebarUserSection />
      </SidebarFooter>
    </Sidebar>
  );
}
