import { PrismaClient } from "@prisma/client";
import { getTodayDate } from "../lib/utils";

const prisma = new PrismaClient();

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.table.deleteMany();
  await prisma.settings.deleteMany();

  await prisma.settings.create({
    data: { id: "settings", restaurantName: "Urban Spice", gstPercent: 5 },
  });

  const tables = await Promise.all(
    Array.from({ length: 10 }).map((_, i) =>
      prisma.table.create({ data: { number: i + 1 } })
    )
  );

  const categories = await Promise.all(
    ["Starters", "Main Course", "Pizza", "Burger", "Beverages", "Desserts"].map(
      (name, idx) => prisma.category.create({ data: { name, sortOrder: idx } })
    )
  );

  const catByName = Object.fromEntries(categories.map((c) => [c.name, c.id]));
  const hotSellerNames = new Set(["Paneer Tikka", "Chicken Tikka", "Butter Chicken", "Chicken Burger", "Masala Coke"]);
  const topSellingNames = new Set(["Chicken Biryani", "Veg Biryani", "Butter Chicken", "Margherita Pizza", "Chicken Burger", "Mango Lassi", "Gulab Jamun"]);
  const restaurantSpecialNames = new Set(["Dal Makhani", "Rogan Josh", "Mushroom Truffle Pizza", "Tandoori Prawns", "Gajar Ka Halwa"]);
  const todaySpecialNames = new Set(["Paneer Tikka", "Chicken Burger", "Mango Lassi"]);
  const today = getTodayDate();

  const items = [
    { name: "Paneer Tikka", description: "Char-grilled cottage cheese marinated in smoky spices", price: 220, category: "Starters", isVeg: true, prepTime: 15, img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600" },
    { name: "Chicken Tikka", description: "Tandoor-roasted chicken chunks with mint chutney", price: 260, category: "Starters", isVeg: false, prepTime: 18, img: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600" },
    { name: "Veg Spring Rolls", description: "Crispy rolls stuffed with fresh vegetables", price: 180, category: "Starters", isVeg: true, prepTime: 12, img: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600" },
    { name: "Veg Biryani", description: "Fragrant basmati rice layered with spiced vegetables", price: 240, category: "Main Course", isVeg: true, prepTime: 25, img: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600" },
    { name: "Chicken Biryani", description: "Slow-cooked basmati rice with tender chicken and saffron", price: 300, category: "Main Course", isVeg: false, prepTime: 28, img: "https://images.unsplash.com/photo-1563379091339-03246963d96c?w=600" },
    { name: "Butter Naan", description: "Soft leavened bread brushed with butter", price: 60, category: "Main Course", isVeg: true, prepTime: 10, img: "https://images.unsplash.com/photo-1626777553635-be04b56a4054?w=600" },
    { name: "Dal Makhani", description: "Slow-simmered black lentils in a creamy tomato gravy", price: 200, category: "Main Course", isVeg: true, prepTime: 20, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600" },
    { name: "Margherita Pizza", description: "Classic pizza with mozzarella, basil and tomato sauce", price: 280, category: "Pizza", isVeg: true, prepTime: 20, img: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600" },
    { name: "Pepperoni Pizza", description: "Loaded with spicy pepperoni and melted cheese", price: 340, category: "Pizza", isVeg: false, prepTime: 22, img: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600" },
    { name: "Chicken Burger", description: "Grilled chicken patty with lettuce, cheese and special sauce", price: 220, category: "Burger", isVeg: false, prepTime: 15, img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600" },
    { name: "Veg Burger", description: "Crispy veg patty with fresh veggies and mayo", price: 180, category: "Burger", isVeg: true, prepTime: 12, img: "https://images.unsplash.com/photo-1550317138-10000687a72b?w=600" },
    { name: "French Fries", description: "Golden crispy fries with a side of ketchup", price: 120, category: "Burger", isVeg: true, prepTime: 10, img: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600" },
    { name: "Masala Coke", description: "Chilled cola with a tangy Indian spice twist", price: 90, category: "Beverages", isVeg: true, prepTime: 5, img: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600" },
    { name: "Fresh Lime Soda", description: "Refreshing lime soda, sweet or salted", price: 80, category: "Beverages", isVeg: true, prepTime: 5, img: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=600" },
    { name: "Mango Lassi", description: "Creamy yogurt smoothie blended with sweet mango", price: 110, category: "Beverages", isVeg: true, prepTime: 5, img: "https://images.unsplash.com/photo-1553787434-dd9eb4ea4d6b?w=600" },
    { name: "Gulab Jamun", description: "Soft milk dumplings soaked in rose-cardamom syrup", price: 100, category: "Desserts", isVeg: true, prepTime: 8, img: "https://images.unsplash.com/photo-1601303516534-bf0496a468bf?w=600" },
    { name: "Chocolate Brownie", description: "Warm fudgy brownie served with vanilla ice cream", price: 150, category: "Desserts", isVeg: true, prepTime: 10, img: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600" },
    { name: "Hara Bhara Kebab", description: "Spinach and green pea patties with mint chutney", price: 190, category: "Starters", isVeg: true, prepTime: 14, img: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600" },
    { name: "Samosa Chaat", description: "Crispy samosas topped with yogurt and chutneys", price: 160, category: "Starters", isVeg: true, prepTime: 12, img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600" },
    { name: "Tandoori Mushroom", description: "Spiced mushrooms roasted in the tandoor", price: 210, category: "Starters", isVeg: true, prepTime: 16, img: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600" },
    { name: "Aloo Tikki", description: "Golden potato patties served with house chutneys", price: 150, category: "Starters", isVeg: true, prepTime: 12, img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600" },
    { name: "Chicken 65", description: "Crisp, spicy chicken bites finished with curry leaves", price: 240, category: "Starters", isVeg: false, prepTime: 18, img: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600" },
    { name: "Seekh Kebab", description: "Minced lamb kebabs grilled with aromatic spices", price: 280, category: "Starters", isVeg: false, prepTime: 20, img: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600" },
    { name: "Crispy Corn", description: "Crunchy corn tossed with chili and fresh herbs", price: 180, category: "Starters", isVeg: true, prepTime: 12, img: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600" },
    { name: "Fish Amritsari", description: "Battered fish fried with Punjabi spices", price: 290, category: "Starters", isVeg: false, prepTime: 18, img: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600" },
    { name: "Dahi Puri", description: "Crisp puris filled with yogurt, potato and chutneys", price: 170, category: "Starters", isVeg: true, prepTime: 10, img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600" },
    { name: "Tandoori Prawns", description: "Prawns marinated in spices and charred in the tandoor", price: 340, category: "Starters", isVeg: false, prepTime: 20, img: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600" },
    { name: "Paneer Butter Masala", description: "Paneer in a rich tomato and butter gravy", price: 260, category: "Main Course", isVeg: true, prepTime: 22, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600" },
    { name: "Shahi Paneer", description: "Cottage cheese simmered in a creamy cashew sauce", price: 270, category: "Main Course", isVeg: true, prepTime: 22, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600" },
    { name: "Palak Paneer", description: "Paneer cubes in a smooth spinach curry", price: 240, category: "Main Course", isVeg: true, prepTime: 20, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600" },
    { name: "Chole Bhature", description: "Spiced chickpeas served with fluffy fried bread", price: 220, category: "Main Course", isVeg: true, prepTime: 20, img: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600" },
    { name: "Rogan Josh", description: "Slow-cooked lamb curry with Kashmiri spices", price: 360, category: "Main Course", isVeg: false, prepTime: 30, img: "https://images.unsplash.com/photo-1563379091339-03246963d96c?w=600" },
    { name: "Chicken Korma", description: "Tender chicken in a fragrant yogurt and cashew gravy", price: 320, category: "Main Course", isVeg: false, prepTime: 28, img: "https://images.unsplash.com/photo-1563379091339-03246963d96c?w=600" },
    { name: "Butter Chicken", description: "Tandoori chicken in a buttery tomato sauce", price: 330, category: "Main Course", isVeg: false, prepTime: 26, img: "https://images.unsplash.com/photo-1563379091339-03246963d96c?w=600" },
    { name: "Kadai Paneer", description: "Paneer and peppers tossed in freshly ground spices", price: 250, category: "Main Course", isVeg: true, prepTime: 22, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600" },
    { name: "Mutton Curry", description: "Slow-braised mutton in a homestyle curry", price: 370, category: "Main Course", isVeg: false, prepTime: 32, img: "https://images.unsplash.com/photo-1563379091339-03246963d96c?w=600" },
    { name: "Jeera Rice", description: "Basmati rice tempered with cumin and herbs", price: 140, category: "Main Course", isVeg: true, prepTime: 12, img: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600" },
    { name: "Farmhouse Pizza", description: "Bell peppers, onions, mushrooms and mozzarella", price: 320, category: "Pizza", isVeg: true, prepTime: 22, img: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600" },
    { name: "Four Cheese Pizza", description: "Mozzarella, cheddar, parmesan and blue cheese", price: 360, category: "Pizza", isVeg: true, prepTime: 22, img: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600" },
    { name: "BBQ Chicken Pizza", description: "Smoky barbecue chicken with onions and mozzarella", price: 370, category: "Pizza", isVeg: false, prepTime: 24, img: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600" },
    { name: "Tandoori Paneer Pizza", description: "Tandoori paneer, peppers and mint drizzle", price: 350, category: "Pizza", isVeg: true, prepTime: 24, img: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600" },
    { name: "Peri Peri Chicken Pizza", description: "Spicy chicken, peppers and creamy mozzarella", price: 380, category: "Pizza", isVeg: false, prepTime: 24, img: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600" },
    { name: "Veggie Supreme Pizza", description: "Loaded with seasonal vegetables and olives", price: 340, category: "Pizza", isVeg: true, prepTime: 22, img: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600" },
    { name: "Pesto Corn Pizza", description: "Sweet corn, basil pesto and mozzarella", price: 310, category: "Pizza", isVeg: true, prepTime: 20, img: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600" },
    { name: "Spicy Chicken Pizza", description: "Chicken, jalapenos and chili flakes", price: 360, category: "Pizza", isVeg: false, prepTime: 23, img: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600" },
    { name: "Mushroom Truffle Pizza", description: "Roasted mushrooms, mozzarella and truffle oil", price: 390, category: "Pizza", isVeg: true, prepTime: 24, img: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600" },
    { name: "Tikka Masala Pizza", description: "Chicken tikka, masala sauce and red onion", price: 380, category: "Pizza", isVeg: false, prepTime: 24, img: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600" },
    { name: "Chicken Tikka Burger", description: "Grilled tikka chicken with mint yogurt sauce", price: 250, category: "Burger", isVeg: false, prepTime: 16, img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600" },
    { name: "Paneer Crunch Burger", description: "Crispy paneer, lettuce and tangy tomato relish", price: 220, category: "Burger", isVeg: true, prepTime: 15, img: "https://images.unsplash.com/photo-1550317138-10000687a72b?w=600" },
    { name: "Double Cheese Burger", description: "Two grilled patties with cheddar and house sauce", price: 290, category: "Burger", isVeg: false, prepTime: 18, img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600" },
    { name: "BBQ Chicken Burger", description: "Grilled chicken, smoky barbecue sauce and slaw", price: 260, category: "Burger", isVeg: false, prepTime: 16, img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600" },
    { name: "Spicy Aloo Burger", description: "Crispy potato patty with chili mayo", price: 170, category: "Burger", isVeg: true, prepTime: 12, img: "https://images.unsplash.com/photo-1550317138-10000687a72b?w=600" },
    { name: "Mushroom Swiss Burger", description: "Sauteed mushrooms, Swiss cheese and pepper mayo", price: 270, category: "Burger", isVeg: true, prepTime: 17, img: "https://images.unsplash.com/photo-1550317138-10000687a72b?w=600" },
    { name: "Peri Peri Chicken Burger", description: "Crispy chicken with peri peri sauce and lettuce", price: 260, category: "Burger", isVeg: false, prepTime: 16, img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600" },
    { name: "Crispy Fish Burger", description: "Golden fish fillet with tartar sauce and slaw", price: 280, category: "Burger", isVeg: false, prepTime: 17, img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600" },
    { name: "Masala Veg Burger", description: "Spiced vegetable patty with chutney and onions", price: 190, category: "Burger", isVeg: true, prepTime: 14, img: "https://images.unsplash.com/photo-1550317138-10000687a72b?w=600" },
    { name: "Lamb Kebab Burger", description: "Grilled lamb patty with pickled onions and raita", price: 310, category: "Burger", isVeg: false, prepTime: 18, img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600" },
    { name: "Rose Lassi", description: "Chilled yogurt drink with fragrant rose syrup", price: 120, category: "Beverages", isVeg: true, prepTime: 5, img: "https://images.unsplash.com/photo-1553787434-dd9eb4ea4d6b?w=600" },
    { name: "Salted Lassi", description: "Savory yogurt drink with roasted cumin", price: 100, category: "Beverages", isVeg: true, prepTime: 5, img: "https://images.unsplash.com/photo-1553787434-dd9eb4ea4d6b?w=600" },
    { name: "Badam Milk", description: "Cold almond milk blended with saffron", price: 130, category: "Beverages", isVeg: true, prepTime: 6, img: "https://images.unsplash.com/photo-1553787434-dd9eb4ea4d6b?w=600" },
    { name: "Masala Chai", description: "Freshly brewed tea with ginger and warming spices", price: 60, category: "Beverages", isVeg: true, prepTime: 7, img: "https://images.unsplash.com/photo-1553787434-dd9eb4ea4d6b?w=600" },
    { name: "Iced Coffee", description: "Chilled coffee served over ice", price: 120, category: "Beverages", isVeg: true, prepTime: 5, img: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600" },
    { name: "Classic Cold Coffee", description: "Creamy blended coffee topped with foam", price: 150, category: "Beverages", isVeg: true, prepTime: 6, img: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600" },
    { name: "Watermelon Cooler", description: "Fresh watermelon blended with lime", price: 130, category: "Beverages", isVeg: true, prepTime: 5, img: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=600" },
    { name: "Virgin Mint Mojito", description: "Mint, lime and soda over crushed ice", price: 140, category: "Beverages", isVeg: true, prepTime: 5, img: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=600" },
    { name: "Mango Shake", description: "Ripe mango blended with chilled milk", price: 150, category: "Beverages", isVeg: true, prepTime: 6, img: "https://images.unsplash.com/photo-1553787434-dd9eb4ea4d6b?w=600" },
    { name: "Sweet Iced Tea", description: "Brewed black tea chilled with lemon", price: 100, category: "Beverages", isVeg: true, prepTime: 5, img: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=600" },
    { name: "Rasmalai", description: "Soft cheese dumplings in saffron milk", price: 130, category: "Desserts", isVeg: true, prepTime: 8, img: "https://images.unsplash.com/photo-1601303516534-bf0496a468bf?w=600" },
    { name: "Rice Kheer", description: "Creamy rice pudding with cardamom and nuts", price: 110, category: "Desserts", isVeg: true, prepTime: 8, img: "https://images.unsplash.com/photo-1601303516534-bf0496a468bf?w=600" },
    { name: "Malai Kulfi", description: "Traditional slow-cooked cream and pistachio kulfi", price: 120, category: "Desserts", isVeg: true, prepTime: 5, img: "https://images.unsplash.com/photo-1601303516534-bf0496a468bf?w=600" },
    { name: "Jalebi", description: "Crisp saffron spirals served warm", price: 100, category: "Desserts", isVeg: true, prepTime: 10, img: "https://images.unsplash.com/photo-1601303516534-bf0496a468bf?w=600" },
    { name: "Baked Cheesecake", description: "Creamy cheesecake with a buttery biscuit base", price: 190, category: "Desserts", isVeg: true, prepTime: 8, img: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600" },
    { name: "Tiramisu", description: "Coffee-soaked sponge layered with mascarpone cream", price: 210, category: "Desserts", isVeg: true, prepTime: 8, img: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600" },
    { name: "Ice Cream Sundae", description: "Vanilla ice cream with chocolate sauce and nuts", price: 170, category: "Desserts", isVeg: true, prepTime: 6, img: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600" },
    { name: "Gajar Ka Halwa", description: "Slow-cooked carrot pudding with nuts", price: 140, category: "Desserts", isVeg: true, prepTime: 8, img: "https://images.unsplash.com/photo-1601303516534-bf0496a468bf?w=600" },
    { name: "Rasgulla", description: "Soft cottage cheese dumplings in light syrup", price: 100, category: "Desserts", isVeg: true, prepTime: 5, img: "https://images.unsplash.com/photo-1601303516534-bf0496a468bf?w=600" },
    { name: "Mango Mousse", description: "Light mango mousse finished with fresh fruit", price: 160, category: "Desserts", isVeg: true, prepTime: 8, img: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600" },
  ];

  for (const item of items) {
    await prisma.menuItem.create({
      data: {
        name: item.name,
        description: item.description,
        price: item.price,
        imageUrl: item.img,
        isVeg: item.isVeg,
        isAvailable: true,
        isHotSeller: hotSellerNames.has(item.name),
        isTopSelling: topSellingNames.has(item.name),
        isRestaurantSpecial: restaurantSpecialNames.has(item.name),
        specialDiscountPercent: todaySpecialNames.has(item.name) ? 15 : 0,
        specialDiscountDate: todaySpecialNames.has(item.name) ? today : null,
        prepTime: item.prepTime,
        categoryId: catByName[item.category],
      },
    });
  }

  // Mark one item unavailable for demo
  const friesItem = await prisma.menuItem.findFirst({ where: { name: "French Fries" } });
  if (friesItem) {
    await prisma.menuItem.update({ where: { id: friesItem.id }, data: { isAvailable: false } });
  }

  // Demo order
  const chicken = await prisma.menuItem.findFirst({ where: { name: "Chicken Burger" } });
  const coke = await prisma.menuItem.findFirst({ where: { name: "Masala Coke" } });
  if (chicken && coke) {
    const subtotal = chicken.price * 2 + coke.price * 1;
    const gst = +(subtotal * 0.05).toFixed(2);
    await prisma.order.create({
      data: {
        orderNumber: "ORD-20260924-001",
        tableId: tables[6].id,
        subtotal,
        gstAmount: gst,
        total: +(subtotal + gst).toFixed(2),
        status: "PREPARING",
        prepTime: 15,
        items: {
          create: [
            { name: chicken.name, price: chicken.price, quantity: 2, menuItemId: chicken.id },
            { name: coke.name, price: coke.price, quantity: 1, menuItemId: coke.id },
          ],
        },
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
