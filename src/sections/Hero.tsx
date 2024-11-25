"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { MoveRight } from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { useRef } from "react";
import { useRecoilState } from "recoil";

import { CustomSession } from "@/_types";
// import productImage from "@/assets/section/product-image.png";
import productImage from "@/assets/section/hero.gif";
import { Button } from "@/components";
import BlurIn from "@/components/ui/blur-in";
import { ManualCursor } from "@/components/whiteboard/collaborate";
// import TypingAnimation from "@/components/ui/typing-animation";
import { Link } from "@/navigation";
import { globalCursorState } from "@/state";
import { uppercaseFirstLetter } from "@/utils";

function Hero() {
  const session: any = useSession();

  const text = useTranslations("Index");
  const locale = useLocale();
  const landingText = useTranslations("landing");
  const safeSession = session ? (session as unknown as CustomSession) : null;

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start end", "end start"],
  });
  const translateY = useTransform(scrollYProgress, [0, 1.5], [900, -120]);

  const [cursorVisible, setCursorVisible] = useRecoilState(globalCursorState);

  const handleMouseEnter = () => setCursorVisible(true);
  const handleMouseLeave = () => setCursorVisible(false);

  const allCursorsProps = [
    {
      x: -50,
      y: 100,
      onHoverX: -150,
      onHoverY: 100,
      name: "Snize",
      connectionId: 1,
      translateY: [-20, 15],
      duration: 3,
      blur: 1,
    },
    {
      x: -20,
      y: 350,
      onHoverX: -150,
      onHoverY: 400,
      name: "Emji",
      connectionId: 8,
      translateY: [-10, 15],
      duration: 5,
      blur: 1.6,
    },
    {
      x: 500,
      y: 350,
      onHoverX: 700,
      onHoverY: 350,
      name: "Jane",
      connectionId: 3,
      translateY: [-15, 20],
      duration: 6,
      blur: 1,
    },
    {
      x: 620,
      y: 120,
      onHoverX: 780,
      onHoverY: 60,
      name: "John",
      connectionId: 2,
      translateY: [-30, 0],
      duration: 4,
      blur: 1.5,
    },
  ];

  const moveX = 290;
  const moveY = 20;

  return (
    <section
      ref={heroRef}
      className="relative bg-[radial-gradient(ellipse_80%_40%_at_bottom,#C8CFFFFF,#FCFDFFFF_100%)] dark:bg-[radial-gradient(ellipse_50%_30%_at_bottom,#0627FF7F,#00000000_100%)] pb-20 pt-32 md:overflow-x-clip md:pb-10 md:pt-32 h-[100vh]"
    >
      <div className="container">
        <div className="relative md:flex flex-col md:items-center text-left md:text-center ">
          {allCursorsProps.map((cursorProps, index) => (
            <motion.div
              key={index}
              animate={{
                translateY: cursorProps.translateY,
                transition: {
                  repeat: Infinity,
                  repeatType: "mirror",
                  duration: cursorProps.duration,
                  ease: "easeInOut",
                },
              }}
              className="absolute top-0 hidden md:block transition-all duration-1000 ease-out"
              style={{ filter: `blur(${cursorVisible ? cursorProps.blur : 0}px)` }}
            >
              <ManualCursor
                x={cursorVisible ? cursorProps.onHoverX - moveX : cursorProps.x - moveX}
                y={cursorVisible ? cursorProps.onHoverY + moveY : cursorProps.y + moveY}
                name={cursorProps.name}
                connectionId={cursorProps.connectionId}
                duration={cursorProps.duration}
              />
            </motion.div>
          ))}
          <div
            className="group md:w-[578px] my-6 relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="hidden group-hover:block absolute top-0 left-0 border-2 border-primary-color bg-[rgba(77,107,255,0.05)] w-full h-full transition-all duration-200 ease-in-out"></div>
            <div className="hidden group-hover:block absolute -right-2 -top-2 w-4 h-4 rounded-[3px] bg-primary-color"></div>
            <div className="hidden group-hover:block absolute -left-2 -top-2 w-4 h-4 rounded-[3px] bg-primary-color"></div>
            <div className="hidden group-hover:block absolute -left-2 -bottom-2 w-4 h-4 rounded-[3px] bg-primary-color"></div>
            <div className="hidden group-hover:block absolute -right-2 -bottom-2 w-4 h-4 rounded-[3px] bg-primary-color"></div>
            {/* <div className="tag">Beta version </div> */}

            <h1 className="md:text-7xl bg-gradient-to-b from-black to-[#001e80] dark:from-white dark:to-[#C8CFFFFF] bg-clip-text text-5xl font-bold tracking-tighter text-transparent">
              {landingText("title")}
            </h1>
            <BlurIn
              word="Mindgen"
              duration={0.3}
              className="md:text-7xl text-5xl font-bold text-primary-color text-left md:text-center"
            />

            <p className="mt-6 text-xl tracking-tight text-[#010d3e] dark:text-primary-foreground default">
              {landingText("description")}
            </p>

            <div className="mt-[30px] flex flex-col items-start md:items-center">
              <div className="space-x-4">
                {safeSession?.data?.session ? (
                  <Link href={`/dashboard`}>
                    <Button className="w-auto gap-2 !cursor-none">
                      <span>
                        {uppercaseFirstLetter(text("open"))} {locale == "fr" && "l'"}app
                      </span>
                      <MoveRight size={20} />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href={`/dashboard`}>
                      <Button className="w-auto !cursor-none">Start for free</Button>
                    </Link>
                    <Button className="gap-2 !cursor-none" variant={"outline"}>
                      <span>Learn more</span>
                      <MoveRight size={20} />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
          <motion.figure
            className="rounded-[50px] border border-white dark:border-slate-800 bg-[rgba(77,107,255,0.05)] backdrop-filter backdrop-blur-sm w-[1024px] h-[576px] hidden md:absolute md:inset-0 md:mx-auto md:my-auto md:flex z-10"
            style={{ translateY, rotate: 0 }}
          >
            <div className="relative rounded-[40px] p-4 overflow-hidden w-[97%] h-[95%] m-auto">
              <Image
                src={productImage}
                alt="product_image"
                layout="fill"
                // objectFit="contain"
              />
            </div>
          </motion.figure>
        </div>
      </div>
    </section>
  );
}

export { Hero };
