
import { setMyTrips } from '@/redux/slices/tripSlice'
import type { RootState } from '@/redux/stores/store'
import api from '@/services/Axios'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  MapPin,
  Package,
  Wallet,
  Truck,
  CalendarDays,
  ArrowRight,
  Clock,
  TrendingUp,
} from 'lucide-react'

const Overview = () => {
  const dispatch = useDispatch()
  const { myTrips } = useSelector((state: RootState) => state.trips)

  useEffect(() => {
    const getMyTrips = async () => {
      try {
        const res = await api.get('/trip/my-trips')
        dispatch(setMyTrips(res.data.trips))
      } catch (error) {
        console.error('Failed to fetch trips:', error)
      }
    }

    getMyTrips()
  }, [dispatch])

  // Get all parcels from trips
  const allParcels = myTrips.flatMap((trip) =>
    trip.parcels?.map((parcel: any) => ({
      ...parcel,
      tripId: trip._id,
    })) || []
  )

  // Dashboard calculations
  const totalRequests = allParcels.filter(
    (parcel) => parcel.requestStatus === 'pending'
  ).length

  const activeDeliveries = allParcels.filter(
    (parcel) =>
      parcel.requestStatus === 'accepted' &&
      parcel.status !== 'delivered' &&
      parcel.status !== 'cancelled'
  ).length

  const totalEarnings = myTrips.reduce(
    (total, trip) => total + Number(trip.totalEarnings || 0),
    0
  )

  const completedDeliveries = allParcels.filter(
    (parcel) =>
      parcel.requestStatus === 'accepted' &&
      parcel.status === 'delivered'
  ).length

  const stats = [
    {
      label: 'Total Trips',
      value: myTrips.length,
      icon: MapPin,
      color: 'text-[#a3e635]',
      bg: 'bg-[#a3e635]/10',
    },
    {
      label: 'Parcel Requests',
      value: totalRequests,
      icon: Package,
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/10',
    },
    {
      label: 'Active Deliveries',
      value: activeDeliveries,
      icon: Truck,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
    },
    {
      label: 'Total Earnings',
      value: `₹${totalEarnings.toLocaleString('en-IN')}`,
      icon: Wallet,
      color: 'text-[#a3e635]',
      bg: 'bg-[#a3e635]/10',
    },
  ]

  return (
    <div className="min-h-screen bg-[#0b1020] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Welcome */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-[#a3e635]">
            TRAVELLER DASHBOARD
          </p>

          <h1 className="text-3xl font-bold">
            Welcome, Traveller!
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Manage your trips and deliver parcels with ease.
          </p>
        </div>

        {/* Statistics */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon

            return (
              <div
                key={item.label}
                className="rounded-2xl border border-white/10 bg-[#111a2e] p-5 transition hover:border-[#a3e635]/30"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-400">
                    {item.label}
                  </p>

                  <div className={`rounded-xl p-3 ${item.bg}`}>
                    <Icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                </div>

                <h2 className="mt-4 text-2xl font-bold">
                  {item.value}
                </h2>
              </div>
            )
          })}
        </div>

        {/* Delivery Summary */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-[#111a2e] p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-lime-400/10 p-3">
                <TrendingUp className="h-5 w-5 text-lime-400" />
              </div>

              <div>
                <p className="text-sm text-slate-400">
                  Completed Deliveries
                </p>
                <h3 className="mt-1 text-2xl font-bold">
                  {completedDeliveries}
                </h3>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111a2e] p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-yellow-400/10 p-3">
                <Clock className="h-5 w-5 text-yellow-400" />
              </div>

              <div>
                <p className="text-sm text-slate-400">
                  Total Accepted Parcels
                </p>
                <h3 className="mt-1 text-2xl font-bold">
                  {allParcels.filter(
                    (parcel) => parcel.requestStatus === 'accepted'
                  ).length}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Trips */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111a2e]">
          <div className="flex items-center justify-between border-b border-white/10 p-5">
            <div>
              <h2 className="text-lg font-semibold">
                My Recent Trips
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Overview of your latest journeys.
              </p>
            </div>

            <MapPin className="h-5 w-5 text-[#a3e635]" />
          </div>

          {myTrips.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <Package className="mx-auto mb-3 h-10 w-10 text-slate-500" />

              <h3 className="font-semibold">
                No Trips Yet
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                Create your first trip to get started.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {[...myTrips]
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                )
                .slice(0, 5)
                .map((trip) => {
                  const acceptedParcels =
                    trip.parcels?.filter(
                      (parcel: any) =>
                        parcel.requestStatus === 'accepted'
                    ) || []

                  return (
                    <div
                      key={trip._id}
                      className="p-5 transition hover:bg-white/[0.02]"
                    >
                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold">
                              {trip.from}
                            </h3>

                            <ArrowRight className="h-4 w-4 text-[#a3e635]" />

                            <h3 className="text-lg font-semibold">
                              {trip.to}
                            </h3>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-400">
                            <span className="flex items-center gap-2">
                              <CalendarDays className="h-4 w-4" />
                              {new Date(
                                trip.departureDate
                              ).toLocaleDateString()}
                            </span>

                            <span className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              {trip.departureTime}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <span className="rounded-full border border-[#a3e635]/20 bg-[#a3e635]/10 px-3 py-1.5 text-xs font-medium capitalize text-[#a3e635]">
                            {trip.transportMode}
                          </span>

                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
                            {acceptedParcels.length} Accepted Parcels
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default Overview
