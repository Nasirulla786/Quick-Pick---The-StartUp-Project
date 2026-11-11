import type { RootState } from '@/redux/stores/store'
import React from 'react'
import { useSelector } from 'react-redux'

const TravellerChatPage = () => {


  const {userData} = useSelector((state:RootState)=>state.auth)
  console.log("userdata",userData);

  return (
    <div>TravellerChatPage</div>
  )
}

export default TravellerChatPage
