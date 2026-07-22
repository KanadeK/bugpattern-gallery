import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "BugPattern Gallery",
  description: "Executable software failure-pattern exhibits.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
