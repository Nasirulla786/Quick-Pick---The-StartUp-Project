import Trip from "../model/trip.model.js";

export const requestParcel = async (req, res) => {
  try {

    const { id } = req.body; // Parcel ID
    const { tripId } = req.params;


    // 1. Parcel fetch karo
    const response = await fetch(
      `http://localhost:5003/parcel/${id}` ,{
        headers:{
          Cookie :req.headers.cookie || "",
        }
      }
    );



    const data = await response.json();



    if (!response.ok) {
      return res.status(404).json({ message: "Parcel not found" });
    }

    // 2. Trip find karo
    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    // 3. Parcel ID array mein append karo
    trip.parcels.push(id);

    // 4. Save karo
    await trip.save();

    return res.status(200).json({
      message: "Request sent successfully",
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};



export const updatePrice = async (req, res) => {
  try {
    const { id } = req.params
    const { price } = req.body

    const updatedTrip = await Trip.findByIdAndUpdate(
      id,
      { $inc: { totalEarnings: price } },
    
    )

    if (!updatedTrip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Earnings updated successfully',
      trip: updatedTrip,
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
