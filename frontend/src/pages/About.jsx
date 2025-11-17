import React from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
// import Newsletter from '../components/Newsletter'

const About = () => {
  return (
    <div>
      <div className='text-2xl text-center p-8 border-t'>
        <Title text1={'ABOUT'} text2={'US'} />
      </div>

      <div className='my-10 flex flex-col md:flex-row gap-16'>
        <img className='w-full md:max-w-[450px]' src={assets.about_img} alt="" />
        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-700'>
          <p className='font-light'>AURA was born out of a passion for innovation and a desire to revolutionize online shopping. The journey began with a simple idea: to provide a platform where customers can easily discover, explore, and purchase a wide range of products from the comfort of their homes.</p>
          <p className='font-light'>Since our inception, we've worked tirelessly to curate a diverse selection of high-quality products that cater to every taste and preference, from fashion and beauty to electronics and home essentials. We offer an extensive collection sourced from trusted brands and suppliers.</p>
          <b className='text-gray-800'>Our Mission</b>
          <p className='font-light'>Our mission at AURA is to empower customers with choice, convenience, and confidence. We're dedicated to providing a seamless shopping experience that exceeds expectations from browsing and ordering to delivery and beyond.</p>
        </div>
      </div>

      <div className='text-xl py-4'>
        <Title text1={'WHY'} text2={'CHOOSE US'} />
      </div>

      <div className='flex flex-col md:flex-row text-md mb-20'>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Quality Assurance:</b>
          <p className='text-gray-600'>We Meticulously Select And Vet Each Product To Ensure It Meets Our Stringent Quality Standards.</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Convenience:</b>
          <p className='text-gray-600'>With Our User-Friendly interfaace And Hassel-Free Handling Process, Shopping Has Never Been Easier.</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Exceptional Customer Service:</b>
          <p className='text-gray-600'>Our Team Of Dedicated Professionals Is Here To Assist You The Way, Ensuring Your Statisfation Is Our Top Priority.</p>
        </div>
      </div>    
      {/* <Newsletter /> */}
    </div>
  )
}

export default About