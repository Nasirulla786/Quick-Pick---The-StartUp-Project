import type { RootState } from '@/redux/stores/store';
import React from 'react'
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom'

const SenderChatpage = () => {
    const params = useParams();
    console.log(params);
    const {userData} = useSelector((state:RootState)=>state.auth);
    console.log(userData);
  return (
    <div>SenderChatpage</div>
  )
}

export default SenderChatpage
