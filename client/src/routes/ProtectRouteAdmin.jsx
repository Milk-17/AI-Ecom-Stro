import React , { useState, useEffect} from 'react'
import useEcomStore from '../store/ecom-store'
import { currentAdmin } from '../api/auth'
import LodingToRedirect from '../routes/LoadingToRedirect'

const ProtectRouteAdmin = ( {element} ) => {

    const [ok, setOk] = useState(false)
    const user = useEcomStore ((state) => state.user)
    const token = useEcomStore ((state) => state.token)
    

    useEffect(() => {
      if (user && token) {
        //send to backend 
        currentAdmin(token)
        .then((res) => setOk(true))
        .catch((err) => setOk(false))
        
      }
    },[])

  return ok? element : <LodingToRedirect />
  
}

export default ProtectRouteAdmin 