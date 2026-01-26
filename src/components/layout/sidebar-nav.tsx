
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  CheckSquare,
  LayoutDashboard,
  ListTodo,
  Target,
  Bot,
  ShoppingCart,
  Library,
  Briefcase,
  Landmark,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/habits", label: "Habits", icon: CheckSquare },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/projects", label: "Projets", icon: Briefcase },
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/media", label: "Médiathèque", icon: Library },
  { href: "/finances", label: "Finances", icon: Landmark },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <Bot className="w-8 h-8 text-primary" />
          <h1 className="text-xl font-semibold font-headline">Life Architect</h1>
        </div>
      </SidebarHeader>
      <SidebarMenu>
        {navItems.map((item) => (
          <SidebarMenuItem key={item.label}>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.href}
              tooltip={item.label}
            >
              <Link href={item.href}>
                <item.icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      <SidebarFooter className="mt-auto">
        <div className="p-2 hidden flex-col gap-2 group-data-[state=expanded]:flex">
            <div className="rounded-lg bg-accent/80 p-4 text-center">
                <h3 className="font-semibold text-accent-foreground">Upgrade to Pro</h3>
                <p className="text-sm text-muted-foreground mt-1">Unlock AI insights, advanced analytics, and more.</p>
                <Button size="sm" className="mt-4 w-full">Upgrade</Button>
            </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
