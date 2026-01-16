"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EllipsisVertical, LogOut, User } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";

interface DiscussSidebarUserClientProps {
  userName: string;
  userEmail: string;
  userImage: string | null;
}

export default function DiscussSidebarUserClient({
  userName,
  userEmail,
  userImage,
}: DiscussSidebarUserClientProps) {
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);

  const handleSignOutClick = () => {
    setShowSignOutDialog(true);
  };

  const handleConfirmSignOut = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <>
      <div className="flex items-center text-sm gap-2 px-1 py-1.5 text-left">
        <Avatar className="h-8 w-8 rounded-full overflow-hidden flex items-center justify-center bg-gray-200">
          {userImage ? (
            <AvatarImage src={userImage} alt={userName} />
          ) : (
            <AvatarFallback className="flex items-center justify-center w-full h-full">
              <User className="h-4 w-4" />
            </AvatarFallback>
          )}
        </Avatar>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="font-medium">{userName}</span>
          <span className="text-xs text-muted-foreground">{userEmail}</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 hover:bg-gray-100 rounded transition-colors">
              <EllipsisVertical className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="cursor-pointer">
              <ThemeToggle />
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={handleSignOutClick}
              className="cursor-pointer"
            >
              <Button variant="ghost" className="p-0 m-0">
                <LogOut className="" />
                <span>Log out</span>
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to sign out?
            </AlertDialogTitle>
            <AlertDialogDescription>
              You will be redirected to the login page
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSignOut}>
              Sign out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
