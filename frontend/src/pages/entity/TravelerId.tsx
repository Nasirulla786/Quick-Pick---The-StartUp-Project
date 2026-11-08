import React from 'react'
import { useParams } from 'react-router-dom'

const TravelerId = () => {
    const params = useParams();
    console.log(params);
  return (
    <div>TravelerId</div>
  )
}

export default TravelerId
