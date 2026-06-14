import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const isPrivate = data.get("isPrivate") === "true";

    // Dapatkan ekstensi file (default .bin jika tidak ada ekstensi)
    const ext = file.name.split('.').pop() || "bin";
    const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;

    // Tentukan direktori berdasarkan isPrivate
    const baseFolder = isPrivate ? "private" : "public";
    const uploadDir = join(process.cwd(), baseFolder, "uploads");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Tulis file ke lokal VPS
    const path = join(uploadDir, filename);
    await writeFile(path, buffer);

    // Kembalikan URL publik atau URL private docs
    const url = isPrivate ? `/api/docs/${filename}` : `/uploads/${filename}`;

    return NextResponse.json({ success: true, url }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to upload file" }, { status: 500 });
  }
}
