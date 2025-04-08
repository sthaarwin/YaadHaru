import React from "react";
import { Link } from "react-router-dom";
import UserMenu from "./UserMenu";

const YaadHeader: React.FC = () => {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">
            <span className="text-white">Yaad</span>
            <span className="text-purple-500">Haru</span>
          </h1>
          <span className="text-sm text-muted-foreground">Memory Journal</span>
        </Link>
        <UserMenu />
      </div>
    </header>
  );
};

export default YaadHeader;
