import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatCurrency, getActiveSpecialPrice } from "@/lib/utils";

const recipeRequest = /\b(recipe|how\s+to\s+(make|cook|prepare)|cooking\s+instructions|steps\s+to\s+(make|cook|prepare))\b/i;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const menuItemId = typeof body.menuItemId === "string" ? body.menuItemId : "";
  const question = typeof body.question === "string" ? body.question.trim().slice(0, 500) : "Tell me about this dish.";
  if (!menuItemId) return NextResponse.json({ error: "Choose a dish first" }, { status: 400 });

  const item = await prisma.menuItem.findUnique({
    where: { id: menuItemId },
    include: { category: { select: { name: true } } },
  });
  if (!item) return NextResponse.json({ error: "Dish not found" }, { status: 404 });

  if (recipeRequest.test(question)) {
    return NextResponse.json({
      answer: `I can tell you about ${item.name}, but I can’t provide recipes or cooking instructions. ${item.description}`,
      source: "menu",
    });
  }

  const facts = [
    `Dish: ${item.name}`,
    `Category: ${item.category.name}`,
    `Menu description: ${item.description}`,
    `Dietary label: ${item.isVeg ? "vegetarian" : "non-vegetarian"}`,
    `Preparation time: about ${item.prepTime} minutes`,
    `Current price: ${formatCurrency(getActiveSpecialPrice(item))}`,
    `Availability: ${item.isAvailable ? "available" : "currently unavailable"}`,
  ].join("\n");

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      answer: `${item.name} is in ${item.category.name}. ${item.description} It is ${item.isVeg ? "vegetarian" : "non-vegetarian"}, takes about ${item.prepTime} minutes to prepare, and costs ${formatCurrency(getActiveSpecialPrice(item))}. For ingredient or allergen details, please ask restaurant staff.`,
      source: "menu",
    });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.2,
        max_tokens: 180,
        messages: [
          {
            role: "system",
            content: "You are a concise restaurant menu guide. Answer only questions about the selected dish using the supplied menu facts. Never provide recipes, cooking instructions, or claim ingredients/allergens not present in the facts. If facts do not answer the question, say so and suggest asking restaurant staff. Keep replies to 2-3 sentences.",
          },
          { role: "user", content: `${facts}\n\nCustomer question: ${question}` },
        ],
      }),
    });
    if (!response.ok) throw new Error("Dish guide provider request failed");
    const result = await response.json();
    const answer = result.choices?.[0]?.message?.content;
    if (typeof answer !== "string" || !answer.trim()) throw new Error("Dish guide returned no answer");
    return NextResponse.json({ answer: answer.trim(), source: "ai" });
  } catch {
    return NextResponse.json({ error: "The dish guide is temporarily unavailable. Please try again." }, { status: 503 });
  }
}