import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { join } from "path";
import { readFile } from "fs/promises";
import { existsSync } from "fs";

export async function GET(req: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { filename } = await params;

    // Check authorization: Admin can see anything.
    // Nakes can only see if it's in their profile.
    let authorized = false;
    
    if ((session.user as any).role === "admin") {
      authorized = true;
    } else {
      // Check if this document belongs to the current user
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { profile: true }
      });
      
      const profile = user?.profile as any;
      if (profile) {
        const docKtp = profile.dokumenKTP || "";
        const docStr = profile.dokumenSTR || "";
        const docSip = profile.dokumenSIP || "";
        
        if (docKtp.includes(filename) || docStr.includes(filename) || docSip.includes(filename)) {
          authorized = true;
        }
      }
    }

    if (!authorized) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Read file
    const filePath = join(process.cwd(), "private", "uploads", filename);
    if (!existsSync(filePath)) {
      return new NextResponse("File not found", { status: 404 });
    }

    const fileBuffer = await readFile(filePath);
    
    // Guess MIME type
    const ext = filename.split('.').pop()?.toLowerCase() || "";
    let contentType = "application/octet-stream";
    if (ext === "pdf") contentType = "application/pdf";
    else if (ext === "jpg" || ext === "jpeg") contentType = "image/jpeg";
    else if (ext === "png") contentType = "image/png";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
      },
    });

  } catch (error: any) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
