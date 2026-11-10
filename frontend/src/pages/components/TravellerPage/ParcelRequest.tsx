import type { RootState } from '@/redux/stores/store'
import React from 'react'
import { useSelector } from 'react-redux'

const ParcelRequest = () => {




  const {myTrips} = useSelector((state:RootState)=>state.trips);
  console.log("my trips jiji",myTrips);



  return (
    <div>ParcelRequest</div>
  )
}

export default ParcelRequest
