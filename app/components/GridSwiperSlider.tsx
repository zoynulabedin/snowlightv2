import { Swiper } from "swiper/react";
import { Autoplay, Grid, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/grid";
import type { ReactNode } from "react";
import "swiper/css/navigation";

interface GridSwiperSliderProps {
  children: ReactNode;
  rows?: number;
  spaceBetween?: number;
  breakpoints?: {
    [width: number]: {
      slidesPerView: number;
      grid: { rows: number };
    };
  };
}

export default function GridSwiperSlider({
  children,
  rows = 2,
  spaceBetween = 30,
  breakpoints = {
    475: { slidesPerView: 2, grid: { rows: 1 } },
    640: { slidesPerView: 2, grid: { rows: 1 } },
    768: { slidesPerView: 3, grid: { rows: 2 } },
    1024: { slidesPerView: 4, grid: { rows: 2 } },
    1280: { slidesPerView: 5, grid: { rows: 2 } },
    1536: { slidesPerView: 7, grid: { rows: 2 } },
    1920: { slidesPerView: 10, grid: { rows: 2 } },
    2560: { slidesPerView: 12, grid: { rows: 2 } },
  },
}: GridSwiperSliderProps) {
  return (
    <Swiper
      navigation={true}
      modules={[Grid, Navigation, Autoplay]}
      grid={{
        rows,
        fill: "row",
      }}
      autoplay={{
        delay: 5000,
        disableOnInteraction: false,
      }}
      breakpoints={breakpoints}
      spaceBetween={spaceBetween}
      className="!w-full  !mx-auto"
    >
      {children}
    </Swiper>
  );
}
