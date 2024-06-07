-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "bio" TEXT,
    "birthday" DATETIME,
    "gender" TEXT,
    "avatar" TEXT,
    "profession" TEXT,
    "community" TEXT,
    "city" TEXT,
    "province" TEXT,
    "threadId" TEXT,
    "address" TEXT
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "startDate" TEXT,
    "endDate" TEXT,
    "contractType" TEXT,
    "trialPeriod" BOOLEAN,
    "workdayType" TEXT,
    "weeklyHours" REAL,
    "netSalary" REAL,
    "grossSalary" REAL,
    "extraPayments" INTEGER,
    "sector" TEXT,
    "cotizationGroup" TEXT,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Contract_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Password" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "salt" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Password_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_userId_key" ON "Contract"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Password_userId_key" ON "Password"("userId");
