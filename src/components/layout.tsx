import Header from "./header";
import Footer from "./footer";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-4xl w-full mx-auto">{children}</main>
      <Footer />
    </div>
  );
}
