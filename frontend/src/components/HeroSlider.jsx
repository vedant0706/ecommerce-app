import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Autoplay, Pagination } from "swiper/modules";
import header_1  from "../assets/all_clothes/top_5.avif";
import header_2  from "../assets/all_clothes/top_6.avif";
import header_3  from "../assets/all_clothes/MT_6.jpg";
import header_4  from "../assets/all_clothes/MT_7.webp";


export default function HeroSlider() {
  return (
    <Swiper
      modules={[Autoplay, Pagination]}
      autoplay={{ delay: 3000, disableOnInteraction: false }}
      loop={true}
      pagination={{ clickable: true }}
      className="mySwiper"
    >
      <SwiperSlide>
        <img src={header_1} className="w-full h-130" alt="slide 1" />
      </SwiperSlide>

      <SwiperSlide>
        <img src={header_2} className="w-full h-130" alt="slide 2" />
      </SwiperSlide>

      <SwiperSlide>
        <img src={header_3} className="w-full h-130" alt="slide 3" />
      </SwiperSlide>

      <SwiperSlide>
        <img src={header_4} className="w-full h-130" alt="slide 4" />
      </SwiperSlide>
    </Swiper>
  );
}
