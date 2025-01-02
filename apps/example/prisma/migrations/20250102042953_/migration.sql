/*
  Warnings:

  - The primary key for the `Profile` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `bio` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Profile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[account_id]` on the table `Profile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `account_id` to the `Profile` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_userId_fkey";

-- DropIndex
DROP INDEX "Profile_userId_key";

-- AlterTable
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_pkey",
DROP COLUMN "bio",
DROP COLUMN "createdAt",
DROP COLUMN "id",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "account_id" INTEGER NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "discord_handle" TEXT,
ADD COLUMN     "display_picture" TEXT,
ADD COLUMN     "is_receive_notification" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "profile_id" SERIAL NOT NULL,
ADD COLUMN     "telegram_handle" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3),
ADD COLUMN     "x_handle" TEXT,
ADD CONSTRAINT "Profile_pkey" PRIMARY KEY ("profile_id");

-- CreateTable
CREATE TABLE "Account" (
    "account_id" SERIAL NOT NULL,
    "arcade_username" TEXT,
    "wallet_address" TEXT NOT NULL,
    "email" TEXT,
    "id_token" TEXT NOT NULL,
    "verifier_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "Account_pkey" PRIMARY KEY ("account_id")
);

-- CreateTable
CREATE TABLE "PlayerLaunchGame" (
    "player_game_id" SERIAL NOT NULL,
    "account_id" INTEGER NOT NULL,
    "game_id" INTEGER NOT NULL,
    "timestamp_of_last_launch" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "PlayerLaunchGame_pkey" PRIMARY KEY ("player_game_id")
);

-- CreateTable
CREATE TABLE "Game" (
    "game_id" SERIAL NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "deeplink_url" TEXT,
    "game_thumbnail_url" TEXT,
    "game_background_url" TEXT,
    "ios_app_id" TEXT,
    "blockchain_id" INTEGER,
    "is_partnered_game" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "Game_pkey" PRIMARY KEY ("game_id")
);

-- CreateTable
CREATE TABLE "Blockchain" (
    "blockchain_id" SERIAL NOT NULL,
    "blockchain_name" TEXT NOT NULL,
    "blockchain_logo" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "Blockchain_pkey" PRIMARY KEY ("blockchain_id")
);

-- CreateTable
CREATE TABLE "GameTag" (
    "game_tag_id" SERIAL NOT NULL,
    "game_tag_description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "GameTag_pkey" PRIMARY KEY ("game_tag_id")
);

-- CreateTable
CREATE TABLE "GameTagRelation" (
    "id" SERIAL NOT NULL,
    "game_id" INTEGER NOT NULL,
    "game_tag_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "GameTagRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameSection" (
    "game_section_id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "order_index" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "GameSection_pkey" PRIMARY KEY ("game_section_id")
);

-- CreateTable
CREATE TABLE "GameSectionRelation" (
    "id" SERIAL NOT NULL,
    "game_id" INTEGER NOT NULL,
    "game_section_id" INTEGER NOT NULL,
    "game_order_in_section" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "GameSectionRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GamePlatform" (
    "game_platform_id" SERIAL NOT NULL,
    "game_platform_name" TEXT,
    "game_platform_logo" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "GamePlatform_pkey" PRIMARY KEY ("game_platform_id")
);

-- CreateTable
CREATE TABLE "GamePlatformRelation" (
    "id" SERIAL NOT NULL,
    "game_id" INTEGER NOT NULL,
    "game_platform_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "GamePlatformRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameMedia" (
    "game_media_id" SERIAL NOT NULL,
    "game_id" INTEGER NOT NULL,
    "medium_url" TEXT,
    "file_type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "GameMedia_pkey" PRIMARY KEY ("game_media_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_arcade_username_key" ON "Account"("arcade_username");

-- CreateIndex
CREATE UNIQUE INDEX "Account_wallet_address_key" ON "Account"("wallet_address");

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_verifier_id_key" ON "Account"("verifier_id");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_account_id_key" ON "Profile"("account_id");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerLaunchGame" ADD CONSTRAINT "PlayerLaunchGame_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerLaunchGame" ADD CONSTRAINT "PlayerLaunchGame_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "Game"("game_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_blockchain_id_fkey" FOREIGN KEY ("blockchain_id") REFERENCES "Blockchain"("blockchain_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameTagRelation" ADD CONSTRAINT "GameTagRelation_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "Game"("game_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameTagRelation" ADD CONSTRAINT "GameTagRelation_game_tag_id_fkey" FOREIGN KEY ("game_tag_id") REFERENCES "GameTag"("game_tag_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameSectionRelation" ADD CONSTRAINT "GameSectionRelation_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "Game"("game_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameSectionRelation" ADD CONSTRAINT "GameSectionRelation_game_section_id_fkey" FOREIGN KEY ("game_section_id") REFERENCES "GameSection"("game_section_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GamePlatformRelation" ADD CONSTRAINT "GamePlatformRelation_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "Game"("game_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GamePlatformRelation" ADD CONSTRAINT "GamePlatformRelation_game_platform_id_fkey" FOREIGN KEY ("game_platform_id") REFERENCES "GamePlatform"("game_platform_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameMedia" ADD CONSTRAINT "GameMedia_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "Game"("game_id") ON DELETE RESTRICT ON UPDATE CASCADE;
