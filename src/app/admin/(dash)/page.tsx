import type { Metadata } from "next";
import { DashboardClient } from "./dashboard-client";

export const metadata: Metadata = {
  title: "Dashboard Overview",
};

export default function Page() {
  return <DashboardClient />;
}