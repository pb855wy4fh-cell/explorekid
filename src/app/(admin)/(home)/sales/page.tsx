import { Metadata } from "next";
import SalesChannel from "@/components/sales/sales-channel";
import SalesChannelCountry from "@/components/sales/sales-channel-country";
import SalesStats from "@/components/sales/sales-stats";
import TopProductTable from "@/components/sales/top-product";
import UserRevenueAndStats from "@/components/sales/user-revenue-and-stats-chart";
import UserRetentionHeatmap from "@/components/sales/user-retention-heatmap";

export const metadata: Metadata = {
  title: "Next.js Sales Dashboard | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Sales Dashboard page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function SalesDashboard() {
  return (
    <>
      <div className="space-y-6">
        <SalesStats />
        <UserRevenueAndStats />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
          <UserRetentionHeatmap />
          <SalesChannel />
          <SalesChannelCountry />
        </div>
        <TopProductTable />
      </div>
    </>
  );
}
