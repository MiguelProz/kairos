import React from "react";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";

interface StackedLayoutProps {
  children: React.ReactNode;
}

const StackedLayout: React.FC<StackedLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex justify-center items-start">
        <Card className="w-full max-w-7xl shadow-lg mx-3 p-1">
          <Card className="bg-black p-6 shadow-lg ">{children}</Card>
        </Card>
      </main>
    </div>
  );
};

export default StackedLayout;
