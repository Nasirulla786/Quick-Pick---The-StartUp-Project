import type { RootState } from '@/redux/stores/store'
import React from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import TravellerPage from './entity/TravellerPage'
import { SenderPage } from './entity/SenderPage'

const Home = () => {
  const { userData } = useSelector((state: RootState) => state.auth)
  const navigate = useNavigate()



  if (userData?.emailVerified) {
    navigate("/login-user")

  };



  const entity = userData?.entity;
  if (entity == null) {
    navigate("/select-entity")

  }
  console.log(entity=="sender");

  if(entity=="sender"){
    return <SenderPage />
  }

  if(entity=="traveller"){
return <TravellerPage />
  }






  return (
    <div>Home</div>
  )
}

export default Home
