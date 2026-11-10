import Parcel from "../model/parcel.js";

export const findRequestParcel = async (req, res) => {
  try {
    const travellers = await Parcel.find({
      traveller: { $ne: null },
      requestStatus: "accepted",
    });

    return res.status(200).json({
      success: true,
      travellers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
