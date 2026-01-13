-- DropForeignKey
ALTER TABLE "santri" DROP CONSTRAINT "santri_id_fkey";

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_santriId_fkey" FOREIGN KEY ("santriId") REFERENCES "santri"("id") ON DELETE CASCADE ON UPDATE CASCADE;
