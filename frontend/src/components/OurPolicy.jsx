import React from 'react'
import { assets } from '../assets/assets'

const OurPolicy = () => {
  return (
    <div className='flex flex-col sm:flex-row justify-around gap-12 sm:gap-2 text-center py-20 text-xs sm:text-2xl-sm md:text-base text-gray-700'>
        <div className='px-4 py-2 rounded shadow-2xl'>
            <img src={assets.exchange_icon} className='w-12 m-auto mb-5' alt="" />
            <p className='font-semibold'>Free Delivery*</p>
            <p className='text-gray-500'>Zero shipping fees, guaranteed.</p>
        </div>

        <div className='px-4 py-2 rounded shadow-2xl'>
            <img src={assets.quality_icon} className='w-12 m-auto mb-5' alt="" />
            <p className='font-semibold'>Easy return & Exchange*</p>
            <p className='text-gray-500'>Free replacement if tag and packing intact.</p>
        </div>

        <div className='px-4 py-2 rounded shadow-2xl'>
            <img src={assets.support_img} className='w-12 m-auto mb-5' alt="" />
            <p className='font-semibold'>Best customer support</p>
            <p className='text-gray-500'>We provide 24/7 customer support</p>
        </div>
    </div>
  )
}

export default OurPolicy