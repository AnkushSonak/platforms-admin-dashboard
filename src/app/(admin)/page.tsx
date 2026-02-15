'use client'

import type { Metadata } from "next";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import React from "react";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import DemographicCard from "@/components/ecommerce/DemographicCard";
import { useSelector } from "react-redux";
import { RootState } from "@/state/store";
import { redirect } from "next/navigation";

// export const metadata: Metadata = {
//   title:
//     "Next.js E-commerce Dashboard | TailAdmin - Next.js Dashboard Template",
//   description: "This is Next.js Home for TailAdmin Dashboard Template",
// };

export default function Ecommerce() {

      const { user, loading: authLoading } = useSelector((state: RootState) => state.authentication);
  
      if (authLoading) {
        return (
          <div className="flex items-center justify-center h-full min-h-[calc(100vh-100px)]">
            <p className="">Loading admin panel...</p>
          </div>
        );
      }
    
      if (!user) {
        // This case should ideally be handled by AdminLayout redirecting to login,
        // but a fallback is good.
        return (
          <div className="flex items-center justify-center h-full min-h-[calc(100vh-100px)]">
            <p className="">Access Denied. Please log in.</p>
            {redirect("/signin")};
          </div>
        );
      }
  
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-7">
        <EcommerceMetrics />

        <MonthlySalesChart />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <MonthlyTarget />
      </div>

      <div className="col-span-12">
        <StatisticsChart />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <DemographicCard />
      </div>

      <div className="col-span-12 xl:col-span-7">
        <RecentOrders />
      </div>
    </div>
  );
}
