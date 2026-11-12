
import type { RootState } from '@/redux/stores/store'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { Package, MapPin, CalendarDays, ArrowRight } from 'lucide-react'
import api from '@/services/Axios'

const ActiveDeliveries = () => {
  const { myTrips } = useSelector((state: RootState) => state.trips)

  const [deliveryStatuses, setDeliveryStatuses] = useState<
    Record<string, string>
  >({})

  const activeTrips = myTrips.filter((trip) =>
    trip.parcels?.some(
      (parcel) =>
        String(parcel.trip) === String(trip._id) &&
        parcel.requestStatus === 'accepted'
    )
  )


const handleStatusChange = async (parcelId: string, status: string) => {
  try {


    const response = await api.post(
      `/parcels/change-delivery-status/${parcelId}`,
      { status }
    )

    if (response.data.success) {
      setDeliveryStatuses((prev) => ({
        ...prev,
        [parcelId]: status,
      }))
    }
  } catch (error) {
    console.error('Status update failed:', error)
  }
}

  const getStatus = (parcel: any) =>
    deliveryStatuses[parcel._id] || parcel.status

  const statusStyles: Record<string, string> = {
    pending: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
    'in-transit': 'bg-blue-400/10 text-blue-400 border-blue-400/20',
    delivered: 'bg-lime-400/10 text-lime-400 border-lime-400/20',
    cancelled: 'bg-red-400/10 text-red-400 border-red-400/20',
  }

  return (
    <div className="min-h-screen bg-[#0b1020] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-[#a3e635]">
            DELIVERY MANAGEMENT
          </p>

          <h1 className="text-3xl font-bold tracking-tight">
            Active Deliveries
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Track and manage your accepted parcel deliveries.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Total Deliveries', value: activeTrips.reduce(
              (total, trip) =>
                total + trip.parcels.filter(
                  (p) => String(p.trip) === String(trip._id) &&
                    p.requestStatus === 'accepted'
                ).length, 0
            ) },
            { label: 'Pending', value: Object.values(deliveryStatuses).filter(s => s === 'pending').length },
            { label: 'In Transit', value: Object.values(deliveryStatuses).filter(s => s === 'in-transit').length },
            { label: 'Delivered', value: Object.values(deliveryStatuses).filter(s => s === 'delivered').length },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/10 bg-[#111a2e] p-4"
            >
              <p className="text-sm text-slate-400">{item.label}</p>
              <h2 className="mt-2 text-2xl font-bold text-[#a3e635]">
                {item.value}
              </h2>
            </div>
          ))}
        </div>

        {/* Deliveries */}
        {activeTrips.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#111a2e] px-6 py-16 text-center">
            <Package className="mx-auto mb-4 h-12 w-12 text-slate-500" />

            <h2 className="text-xl font-semibold">
              No Active Deliveries
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Accepted parcels will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {activeTrips.map((trip) => (
              <div
                key={trip._id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-[#111a2e]"
              >
                {/* Trip Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 p-5">
                  <div>
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <MapPin className="h-5 w-5 text-[#a3e635]" />
                      {trip.from}
                      <ArrowRight className="h-4 w-4 text-slate-500" />
                      {trip.to}
                    </div>

                    <p className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                      <CalendarDays className="h-4 w-4" />
                      {new Date(trip.departureDate).toLocaleDateString()}
                      <span>•</span>
                      {trip.departureTime}
                    </p>
                  </div>

                  <span className="rounded-full border border-[#a3e635]/20 bg-[#a3e635]/10 px-3 py-1 text-xs font-medium text-[#a3e635]">
                    {trip.transportMode}
                  </span>
                </div>

                {/* Parcels */}
                <div className="space-y-4 p-5">
                  {trip.parcels
                    .filter(
                      (parcel) =>
                        String(parcel.trip) === String(trip._id) &&
                        parcel.requestStatus === 'accepted'
                    )
                    .map((parcel) => {
                      const status = getStatus(parcel)

                      return (
                        <div
                          key={parcel._id}
                          className="rounded-xl border border-white/10 bg-[#0d1527] p-4 sm:p-5"
                        >
                          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

                            <div>
                              <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-[#a3e635]/10 p-3">
                                  <Package className="h-5 w-5 text-[#a3e635]" />
                                </div>

                                <div>
                                  <h3 className="font-semibold text-white">
                                    {parcel.title}
                                  </h3>
                                  <p className="text-sm text-slate-400">
                                    {parcel.from} → {parcel.to}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-400">
                                <span>{parcel.weight} kg</span>
                                <span>₹{parcel.budget} budget</span>
                              </div>
                            </div>

                            {/* Status */}
                            <div className="w-full sm:w-52">
                              <label className="mb-2 block text-xs font-medium text-slate-400">
                                DELIVERY STATUS
                              </label>

                              <select
                                value={status}
                                disabled={status === 'cancelled' ||  status === 'delivered'}
                                onChange={(e) =>
                                  handleStatusChange(
                                    parcel._id,
                                    e.target.value
                                  )
                                }
                                className="w-full rounded-xl border border-white/10 bg-[#111a2e] px-3 py-3 text-sm text-white outline-none transition focus:border-[#a3e635]"
                              >
                                <option value="pending">Pending</option>
                                <option value="in-transit">In Transit</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>

                              <div className="mt-3">
                                <span
                                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${statusStyles[status] || statusStyles.pending}`}
                                >
                                  {status.replace('-', ' ').toUpperCase()}
                                </span>
                              </div>
                            </div>

                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ActiveDeliveries
