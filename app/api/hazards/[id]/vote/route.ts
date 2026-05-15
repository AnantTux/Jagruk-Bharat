import { NextResponse } from "next/server"
import { voteHazard } from "@/lib/hazard-store"

export const dynamic = "force-dynamic"

type RouteContext = { params: { id: string } }

export async function POST(request: Request, context: RouteContext) {
  const id = context.params.id
  let body: { direction?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (body.direction !== "up" && body.direction !== "down") {
    return NextResponse.json({ error: "direction must be up or down" }, { status: 400 })
  }

  const hazard = voteHazard(id, body.direction)
  if (!hazard) {
    return NextResponse.json({ error: "Hazard not found" }, { status: 404 })
  }

  return NextResponse.json({ hazard })
}
