import type { Metadata } from "next";
import { HomeApp } from "@/components/HomeApp";

export const metadata: Metadata = {
  title: "Workspace",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AppPage() {
  return <HomeApp />;
}
