import { useEffect, useRef } from "react";
import LocomotiveScroll from "locomotive-scroll";

const useLocomotive = () => {
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current = new LocomotiveScroll({
      autoStart: true,
      lenisOptions: {
        lerp: 0.1,
        smoothWheel: true,
      },
    });

    return () => {
      scrollRef.current?.destroy();
      scrollRef.current = null;
    };
  }, []);

  return scrollRef;
};

export default useLocomotive;