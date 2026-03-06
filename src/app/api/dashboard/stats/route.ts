import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, handleValidationError } from "@/lib/api-utils";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    
    // 1. Service Request Stats (Pipeline & Revenue)
    const srStats = await db.serviceRequest.groupBy({
      by: ['status'],
      _count: true,
      _sum: {
        finalAmount: true,
        supplyCost: true,
        laborCost: true,
        outsourceCost: true,
      },
    });

    const pipeline = srStats.map(s => ({
      status: s.status,
      count: s._count,
      value: Number(s._sum.finalAmount || 0),
    }));

    // Only COMPLETED requests count as actual Revenue/Profit
    const completedSRs = srStats.filter(s => s.status === 'COMPLETED');
    const totalRevenue = completedSRs.reduce((acc, s) => acc + Number(s._sum.finalAmount || 0), 0);
    const totalCosts = completedSRs.reduce((acc, s) => 
      acc + Number(s._sum.supplyCost || 0) + Number(s._sum.laborCost || 0) + Number(s._sum.outsourceCost || 0), 0);

    // 2. Machine Health
    const machineHealth = await db.machine.groupBy({
      by: ['status'],
      _count: true,
    });

    // 3. Task Performance
    const taskStats = await db.task.groupBy({
      by: ['status'],
      _count: true,
    });

    // 4. Recent Revenue Trend (simplified for mockup)
    const revenueTrend = [
      { month: 'Jan', revenue: totalRevenue * 0.8, costs: totalCosts * 0.75 },
      { month: 'Feb', revenue: totalRevenue, costs: totalCosts },
    ];

    // 5. Total Clients
    const totalClients = await db.contact.count();

    return apiSuccess({
      overview: {
        totalRevenue,
        totalCosts,
        grossProfit: totalRevenue - totalCosts,
        profitMargin: totalRevenue > 0 ? ((totalRevenue - totalCosts) / totalRevenue) * 100 : 0,
      },
      pipeline,
      machines: machineHealth.map(m => ({ status: m.status, count: m._count })),
      tasks: taskStats.map(t => ({ status: t.status, count: t._count })),
      totalClients,
      revenueTrend,
    });
  } catch (error) {
    return handleValidationError(error);
  }
}
