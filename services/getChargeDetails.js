import omise from "omise";
import dotenv from "dotenv";
dotenv.config();

const omiseClient = omise({
  publicKey: process.env.OMISE_PUBLIC_KEY,
  secretKey: process.env.OMISE_SECRET_KEY,
});

export const getChargeDetails = async (chargeId) => {
  try {
    const charge = await omiseClient.charges.retrieve(chargeId);
    return { success: true, data: charge };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
