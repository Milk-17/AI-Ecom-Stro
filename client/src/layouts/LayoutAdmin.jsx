import React from 'react'
import { Outlet } from 'react-router-dom'
import SideberAdmin from '../components/admin/SideberAdmin'
import HeaderAdmin from '../components/admin/HeaderAdmin'

const LayoutAdmin = () => {
  return (
    <div className='flex h-screen'>
         <SideberAdmin />

         <div className='flex-1 flex flex-col'>        
         <HeaderAdmin />

         <main className='flex-1 p-4 bg-gray-400 overflow-y-auto'>
         <Outlet />
         </main>
         </div>
    </div>
   
  )
}

export default LayoutAdmin