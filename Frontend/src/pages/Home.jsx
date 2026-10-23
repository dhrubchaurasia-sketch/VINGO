import React from 'react'
import { useSelector } from 'react-redux'
import UserDashboard from '../components/UserDashboard'
import OwnerDashboard from '../components/OwnerDashboard'
import DeliveryBoy from '../components/DeliveryBoy'
import Nav from '../components/Nav';
function Home() {
    const { userData } = useSelector((state) => state.user)

    return (

        <div className='w-screen min-h-screen pt-25 flex flex-col items-center bg-[#fff9f6]'>
            <Nav />
            {userData?.role === "user" && <UserDashboard />}
            {userData?.role === "owner" && <OwnerDashboard />}
            {userData?.role === "deliveryBoy" && <DeliveryBoy />}
        </div>
    )
}

export default Home