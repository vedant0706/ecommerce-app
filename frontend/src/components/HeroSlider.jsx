import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Autoplay, Pagination } from "swiper/modules";
import {
  heroSlides1,
  heroSlides2,
  heroSlides3,
  heroSlides4,
} from "../assets/assets.js";

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
        <img src={heroSlides1} className="w-150 h-130" alt="slide 1" />
      </SwiperSlide>

      <SwiperSlide>
        <img src={heroSlides2} className="w-150 h-130" alt="slide 2" />
      </SwiperSlide>

      <SwiperSlide>
        <img src={heroSlides3} className="w-150 h-130" alt="slide 3" />
      </SwiperSlide>

      <SwiperSlide>
        <img src={heroSlides4} className="w-150 h-130" alt="slide 3" />
      </SwiperSlide>
    </Swiper>
  );
}
