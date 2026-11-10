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

console.log("STATUS:", response.status);
console.log("RESPONSE:", data);

    console.log("this is res",response);


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
