
import React from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '@/redux/stores/store'
import {
  Wallet,
  TrendingUp,
  Package,
  Clock,
  MapPin,
  IndianRupee,
} from 'lucide-react'

const Earnings = () => {
  const { myTrips } = useSelector((state: RootState) => state.trips)

  const parcels = myTrips.flatMap((trip) =>
    trip.parcels
      ?.filter(
        (parcel) =>
          String(parcel.trip) === String(trip._id) &&
          parcel.requestStatus === 'accepted'
      )
      .map((parcel) => ({
        ...parcel,
        tripFrom: trip.from,
        tripTo: trip.to,
      })) || []
  )

  const deliveredParcels = parcels.filter(
    (parcel) => parcel.status === 'delivered'
  )

  const pendingParcels = parcels.filter(
    (parcel) =>
      parcel.status === 'pending' ||
      parcel.status === 'in_transit'
  )

  const totalEarnings = deliveredParcels.reduce(
    (total, parcel) => total + Number(parcel.budget || 0),
    0
  )

  const pendingEarnings = pendingParcels.reduce(
    (total, parcel) => total + Number(parcel.budget || 0),
    0
  )

  const stats = [
    {
      title: 'Total Earnings',
      value: totalEarnings,
      icon: Wallet,
      color: 'text-[#a3e635]',
      bg: 'bg-[#a3e635]/10',
    },
    {
      title: 'Pending Earnings',
      value: pendingEarnings,
      icon: Clock,
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/10',
    },
    {
      title: 'Completed Deliveries',
      value: deliveredParcels.length,
      icon: Package,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
    },
    {
      title: 'Total Parcels',
      value: parcels.length,
      icon: TrendingUp,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
    },
  ]

  return (
    <div className="min-h-screen bg-[#0b1020] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-[#a3e635]">
            FINANCIAL OVERVIEW
          </p>

          <h1 className="text-3xl font-bold">
            My Earnings
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Track your delivery earnings and payment progress.
          </p>
        </div>

        {/* Main Balance */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-[#a3e635]/20 bg-gradient-to-br from-[#172a27] to-[#111a2e] p-6 sm:p-8">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Wallet className="h-5 w-5 text-[#a3e635]" />
            Total Earned
          </div>

          <h2 className="mt-4 flex items-center text-4xl font-bold tracking-tight sm:text-5xl">
            <IndianRupee className="h-9 w-9" />
            {totalEarnings.toLocaleString('en-IN')}
          </h2>

          <p className="mt-3 text-sm text-slate-400">
            From {deliveredParcels.length} successfully delivered parcels
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon

            return (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-[#111a2e] p-5"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-400">
                    {item.title}
                  </p>

                  <div className={`rounded-xl p-3 ${item.bg}`}>
                    <Icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                </div>

                <h3 className="mt-4 text-2xl font-bold">
                  {item.title.includes('Deliveries') ||
                  item.title === 'Total Parcels'
                    ? item.value
                    : `₹${item.value.toLocaleString('en-IN')}`}
                </h3>
              </div>
            )
          })}
        </div>

        {/* Earnings History */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111a2e]">
          <div className="border-b border-white/10 p-5">
            <h2 className="text-lg font-semibold">
              Earnings History
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Your parcel delivery records.
            </p>
          </div>

          {parcels.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <Package className="mx-auto mb-3 h-10 w-10 text-slate-500" />

              <h3 className="font-semibold">
                No Earnings Yet
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                Your accepted parcel deliveries will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {parcels.map((parcel) => {
                const isDelivered = parcel.status === 'delivered'
                const isCancelled = parcel.status === 'cancelled'

                return (
                  <div
                    key={parcel._id}
                    className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-[#a3e635]/10 p-3">
                        <Package className="h-5 w-5 text-[#a3e635]" />
                      </div>

                      <div>
                        <h3 className="font-semibold">
                          {parcel.title}
                        </h3>

                        <p className="mt-1 flex items-center gap-1 text-sm text-slate-400">
                          <MapPin className="h-3.5 w-3.5" />
                          {parcel.tripFrom} → {parcel.tripTo}
                        </p>

                        <span
                          className={`mt-2 inline-block rounded-full border px-3 py-1 text-xs ${
                            isDelivered
                              ? 'border-lime-400/20 bg-lime-400/10 text-lime-400'
                              : isCancelled
                              ? 'border-red-400/20 bg-red-400/10 text-red-400'
                              : 'border-yellow-400/20 bg-yellow-400/10 text-yellow-400'
                          }`}
                        >
                          {parcel.status.replace('-', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="sm:text-right">
                      <p className={`text-lg font-bold ${
                        isDelivered
                          ? 'text-[#a3e635]'
                          : 'text-slate-300'
                      }`}>
                        ₹{Number(parcel.budget || 0).toLocaleString('en-IN')}
                      </p>

                      <p className="text-xs text-slate-500">
                        {isDelivered
                          ? 'Earned'
                          : isCancelled
                          ? 'Cancelled'
                          : 'Awaiting delivery'}
                      </p>
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

export default Earnings
