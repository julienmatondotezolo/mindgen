import { NextResponse } from "next/server";

export async function POST(req, res) {
  res.write("Wake up, Neo...\n");
  await new Promise((resolve) => setTimeout(resolve, 1000));
  res.write("The Matrix has you...\n");
  await new Promise((resolve) => setTimeout(resolve, 1000));
  res.write("...");
  await new Promise((resolve) => setTimeout(resolve, 1000));
  res.end();

  return NextResponse.json({ name: "Mindgen" });
}
