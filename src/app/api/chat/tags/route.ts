import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const query = searchParams.get("query") || "";

    if (!category) {
        return NextResponse.json({ success: false, error: "Category is required" }, { status: 400 });
    }

    let results: any[] = [];

    switch (category.toLowerCase()) {
        case "staff":
            results = await prisma.staff.findMany({
                where: {
                    OR: [
                        { firstName: { contains: query } },
                        { lastName: { contains: query } },
                        { email: { contains: query } }
                    ]
                },
                take: 10,
                select: { id: true, firstName: true, lastName: true, avatarUrl: true }
            });
            break;

        case "groups":
            results = await prisma.chatGroup.findMany({
                where: {
                    name: { contains: query },
                    isPrivate: false // Only public groups can be tagged like this? 
                },
                take: 10,
                select: { id: true, name: true, avatarUrl: true }
            });
            break;

        case "service requests":
        case "servicerequest":
            results = await prisma.serviceRequest.findMany({
                where: {
                    OR: [
                        { requestId: { contains: query } },
                        { notes: { contains: query } }
                    ]
                },
                take: 10,
                select: { id: true, requestId: true, status: true, businessUnit: true }
            });
            break;

        case "tasks":
            results = await prisma.task.findMany({
                where: {
                    OR: [
                        { title: { contains: query } },
                        { description: { contains: query } }
                    ]
                },
                take: 10,
                select: { id: true, title: true, status: true, priority: true }
            });
            break;

        case "catalog items":
        case "catalog":
            results = await prisma.catalog.findMany({
                where: {
                    serviceName: { contains: query }
                },
                take: 10,
                select: { id: true, serviceName: true, basePrice: true, businessUnit: true }
            });
            break;

        case "machines":
            results = await prisma.machine.findMany({
                where: {
                    name: { contains: query }
                },
                take: 10,
                select: { id: true, name: true, model: true, status: true }
            });
            break;

        case "suppliers":
            results = await prisma.supplier.findMany({
                where: {
                    name: { contains: query }
                },
                take: 10,
                select: { id: true, name: true, category: true, contactName: true }
            });
            break;

        default:
            return NextResponse.json({ success: false, error: "Invalid category" }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: results });
}
