-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "evalTeknisiKalibrasi",
ADD COLUMN     "evalTeknisiKalibrasi" BOOLEAN,
ADD COLUMN     "namaStafTeknis" TEXT;
