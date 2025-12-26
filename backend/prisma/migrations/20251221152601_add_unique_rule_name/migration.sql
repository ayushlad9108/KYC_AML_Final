/*
  Warnings:

  - A unique constraint covering the columns `[ruleName]` on the table `compliance_rules` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "compliance_rules_ruleName_key" ON "compliance_rules"("ruleName");
