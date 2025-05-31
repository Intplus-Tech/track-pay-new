import { Input } from "@/components/ui/input";
import { Bell, CircleArrowRight, Search } from "lucide-react";
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PageHeader from "@/components/PageHeader";

const Header = () => {
  return (
    <header className="flex items-center justify-between mb-6">
      <PageHeader />
      <div className="rounded-full bg-white border p-2 flex items-center gap-4">
        <span className="relative">
          <Search
            size={16}
            className="absolute top-1/2 left-3 -translate-y-2"
          />
          <Input className="rounded-full pl-8 bg-primary/10" />
        </span>
        <div>
          <Select defaultValue="24">
            <SelectTrigger className="w-[140px] h-8 rounded-full bg-primary/10">
              <SelectValue placeholder="Time filter" />
            </SelectTrigger>
            <SelectContent className="bg-white border shadow-lg">
              <SelectItem value="24">Last 24 Hours</SelectItem>
              <SelectItem value="48">48 Hours</SelectItem>
              <SelectItem value="week">1 Week</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Bell size={20} />
        <CircleArrowRight strokeWidth={1} size={20} color="red" />
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};

export default Header;
