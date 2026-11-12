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



export const changeDeliveredStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const allowedStatus = [
      'pending',
      'in_transit',
      'delivered',
      'cancelled',
    ]

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid delivery status',
      })
    }

    const updateParcel = await Parcel.findByIdAndUpdate(
      id,
      { status },

    )

    if (!updateParcel) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found',
      })
    }


    const response = axios.get( `${process.env.TRIP_SERVICE_URL}/triproute/${updateParcel.trip}`)




    const trip = response.data.trip




    if (status === 'delivered') {
      await axios.post(
        `${process.env.TRIP_SERVICE_URL}/update-price/${updateParcel.trip}`,
        { price: trip.pricePerKg * updateParcel. weight }
      )
    }

    if (status === 'cancelled') {
      await axios.post(
        `${process.env.TRIP_SERVICE_URL}/update-price/${updateParcel.trip}`,
        { price:  (trip.pricePerKg * updateParcel. weight) * 0.20 }
      )
    }

    return res.status(200).json({
      success: true,
      message: 'Delivery status updated successfully',
      parcel: updateParcel,
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
