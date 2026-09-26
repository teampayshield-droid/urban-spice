-- CreateTable
CREATE TABLE "MenuItemLike" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "menuItemId" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MenuItemLike_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "MenuItemLike_createdAt_idx" ON "MenuItemLike"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "MenuItemLike_menuItemId_visitorId_key" ON "MenuItemLike"("menuItemId", "visitorId");
