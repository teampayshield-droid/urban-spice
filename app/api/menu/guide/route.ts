import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatCurrency, getActiveSpecialPrice } from "@/lib/utils";

const recipeRequest = /\b(recipe|how\s+to\s+(make|cook|prepare)|cooking\s+instructions|steps\s+to\s+(make|cook|prepare))\b/i;
const offerRequest = /\b(offer|discount|deal|specials?)\b/i;
const spicyRequest = /\b(spic(?:y|ier)|spicey|chilli?|jalape[nñ]o|peri[\s-]?peri|hot)\b/i;
const budgetRequest = /\b(?:under|below|less\s+than|within|upto|up\s+to|max(?:imum)?(?:\s+of)?|budget(?:\s+of)?)\s*(?:₹|rs\.?\s*)?(\d{2,5})(?:\s+or\s+(?:₹|rs\.?\s*)?(\d{2,5}))?\b|₹\s*(\d{2,5})\b/i;

type GuideMenuItem = {
  name: string;
  description: string;
  price: number;
  specialDiscountPercent: number;
  specialDiscountDate: string | null;
  isAvailable: boolean;
  isVeg: boolean;
  isHotSeller: boolean;
  isRestaurantSpecial: boolean;
  prepTime: number;
  category: { name: string };
};

function itemPrice(item: Pick<GuideMenuItem, "price" | "specialDiscountPercent" | "specialDiscountDate">) {
  return getActiveSpecialPrice(item);
}

function listItems(items: GuideMenuItem[]) {
  return items.map((item) => `${item.name} (${item.category.name}) - ${formatCurrency(itemPrice(item))}`).join(", ");
}

function catalogAnswer(question: string, items: GuideMenuItem[]): string | null {
  const availableItems = items.filter((item) => item.isAvailable);

  if (offerRequest.test(question)) {
    const offers = availableItems.filter((item) => itemPrice(item) < item.price || item.isRestaurantSpecial);
    return offers.length
      ? `Today’s offers and restaurant specials: ${offers.map((item) => `${item.name} at ${formatCurrency(itemPrice(item))}${itemPrice(item) < item.price ? ` (${item.specialDiscountPercent}% off)` : ""}`).join("; ")}.`
      : "There are no active offers or restaurant specials listed today.";
  }

  if (spicyRequest.test(question)) {
    const spicyItems = availableItems.filter((item) => /\b(spic(?:y|ed)|chilli?|jalape[nñ]o|peri[\s-]?peri|pepperoni)\b/i.test(`${item.name} ${item.description}`));
    return spicyItems.length
      ? `These available dishes are described as spicy or include chilli: ${listItems(spicyItems)}. Please ask us for the exact heat level.`
      : "I can’t identify a spicy dish from the menu descriptions. Please ask restaurant staff about today’s spice levels.";
  }

  const budgetMatch = question.match(budgetRequest);
  if (budgetMatch) {
    const budgets = [...new Set([budgetMatch[1], budgetMatch[2], budgetMatch[3]].filter(Boolean).map(Number))];
    if (budgets.length) {
      return budgets.map((budget) => {
        const withinBudget = availableItems.filter((item) => itemPrice(item) <= budget);
        return withinBudget.length
          ? `Up to ${formatCurrency(budget)}: ${listItems(withinBudget)}`
          : `No available dishes are listed at or below ${formatCurrency(budget)}`;
      }).join(". ") + ".";
    }
  }

  return null;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const menuItemId = typeof body.menuItemId === "string" ? body.menuItemId : "";
  const question = typeof body.question === "string" ? body.question.trim().slice(0, 500) : "Tell me about this dish.";
  if (!question) return NextResponse.json({ error: "Ask a menu question first" }, { status: 400 });

  const items = await prisma.menuItem.findMany({
    include: { category: { select: { name: true } } },
    orderBy: [{ category: { sortOrder: "asc" } }, { name: "asc" }],
  });
  const matchedItem = items
    .filter((candidate) => question.toLowerCase().includes(candidate.name.toLowerCase()))
    .sort((first, second) => second.name.length - first.name.length)[0];
  const selectedItem = matchedItem || items.find((candidate) => candidate.id === menuItemId);

  const catalogResponse = catalogAnswer(question, items);
  if (catalogResponse) return NextResponse.json({ answer: catalogResponse, source: "menu" });

  if (recipeRequest.test(question)) {
    return NextResponse.json({
      answer: selectedItem
        ? `I can tell you about ${selectedItem.name}, but I can’t provide recipes or cooking instructions. ${selectedItem.description}`
        : "I can help you choose from the menu, but I can’t provide recipes or cooking instructions.",
      source: "menu",
    });
  }

  const facts = items.map((item) => [
    `Dish: ${item.name}`,
    `Category: ${item.category.name}`,
    `Menu description: ${item.description}`,
    `Dietary label: ${item.isVeg ? "vegetarian" : "non-vegetarian"}`,
    `Preparation time: about ${item.prepTime} minutes`,
    `Current price: ${formatCurrency(itemPrice(item))}${itemPrice(item) < item.price ? ` (${item.specialDiscountPercent}% off today)` : ""}`,
    `Availability: ${item.isAvailable ? "available" : "currently unavailable"}`,
    `Restaurant special: ${item.isRestaurantSpecial ? "yes" : "no"}`,
    `Hot seller: ${item.isHotSeller ? "yes" : "no"}`,
  ].join(" | ")).join("\n");

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    if (!selectedItem) {
      return NextResponse.json({
        answer: "I can help with menu items, ingredients mentioned in their descriptions, dietary labels, availability, prices, spicy dishes, and today’s offers. What would you like to know?",
        source: "menu",
      });
    }
    const ingredientMatch = question.match(/\b(?:contain|contains|have|has|include|includes|made\s+with)\s+(?:any\s+)?(?:the\s+)?(.+?)[?.!]*$/i);
    if (ingredientMatch) {
      const ingredient = ingredientMatch[1].replace(/\s+in\s+it$/i, "").trim();
      const contains = selectedItem.description.toLowerCase().includes(ingredient.toLowerCase());
      return NextResponse.json({
        answer: contains
          ? `Yes, the menu description for ${selectedItem.name} mentions ${ingredient}. ${selectedItem.description}`
          : `The menu description for ${selectedItem.name} doesn’t confirm whether it contains ${ingredient}. Please check with restaurant staff for ingredient or allergen details.`,
        source: "menu",
      });
    }
    return NextResponse.json({
      answer: `${selectedItem.name} is in ${selectedItem.category.name}. ${selectedItem.description} It is ${selectedItem.isVeg ? "vegetarian" : "non-vegetarian"}, takes about ${selectedItem.prepTime} minutes to prepare, and costs ${formatCurrency(itemPrice(selectedItem))}. For ingredient or allergen details not listed in the description, please ask restaurant staff.`,
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
            content: "You are a concise restaurant menu guide. Answer customer questions about any dish or the full menu using only the supplied menu facts. Compare current prices for budget questions and list active offers accurately. Never infer ingredients, allergens, or spice levels beyond what the descriptions state; mention uncertainty and suggest asking restaurant staff where needed. Never provide recipes or cooking instructions. Keep replies to 2-3 sentences.",
          },
          { role: "user", content: `Menu facts:\n${facts}\n\n${selectedItem ? `Dish selected for context: ${selectedItem.name}\n` : ""}Customer question: ${question}` },
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