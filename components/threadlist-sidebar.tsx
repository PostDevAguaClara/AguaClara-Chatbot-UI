import type * as React from "react";
import { FolderOpen } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { ThreadList } from "@/components/thread-list";
import Image from "next/image";

export function ThreadListSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader className="aui-sidebar-header mb-2 border-b">
        <div className="aui-sidebar-header-content flex items-center justify-between">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg">
                <div className="aui-sidebar-header-icon-wrapper flex aspect-square size-8 items-center justify-center">
                  <Image
                    src="/images/aguaclara-icon.png"
                    alt="AguaClara"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>

                <div className="aui-sidebar-header-heading me-6 flex flex-col gap-0.5 leading-none">
                  <span className="aui-sidebar-header-title font-semibold">
                    AguaClara
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Research Assistant
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarHeader>

      <SidebarContent className="aui-sidebar-content px-2">
        <ThreadList />
      </SidebarContent>

      <SidebarRail />

      <SidebarFooter className="aui-sidebar-footer border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={
                <a
                  href="https://drive.google.com/drive/folders/1PmgtZ2GvWRmu_Q277xssbv-lIqSVFAm2"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <div className="aui-sidebar-footer-icon-wrapper bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <FolderOpen className="aui-sidebar-footer-icon size-4" />
              </div>

              <div className="aui-sidebar-footer-heading flex flex-col gap-0.5 leading-none">
                <span className="aui-sidebar-footer-title font-semibold">
                  Source Documents
                </span>
                <span>
                  Google Drive Source
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}