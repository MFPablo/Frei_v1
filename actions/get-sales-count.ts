import prisma from "@/utils/prismaClient";

export const getSalesCount = async (storeId: string) => {
  const salesCount = await prisma.order.count({
    where: {
      storeId,
      isPaid: true
    },
  });

  return salesCount;
};
