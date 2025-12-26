/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `kyc_verifications` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `liveness_detections` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `transactions` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `transactions` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to drop the column `name` on the `users` table. All the data in the column will be lost.
  - Added the required column `transactionType` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "KYCStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED');

-- AlterTable
ALTER TABLE "documents" DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "kyc_verifications" DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "liveness_detections" DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "updatedAt",
ADD COLUMN     "amlStatus" "AMLStatus" NOT NULL DEFAULT 'CLEAR',
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'INR',
ADD COLUMN     "description" TEXT,
ADD COLUMN     "metadata" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "riskScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "transactionTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "transactionType" "TransactionType" NOT NULL,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(15,2);

-- AlterTable
ALTER TABLE "users" DROP COLUMN "name",
ADD COLUMN     "kycStatus" "KYCStatus" NOT NULL DEFAULT 'NOT_STARTED',
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "riskScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'PENDING';
