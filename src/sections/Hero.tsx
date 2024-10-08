"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { MousePointer2, MoveRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { MindMapDetailsProps } from "@/_types";
import productImage from "@/assets/section/product-image.png";
import { Button, Whiteboard } from "@/components";
import BlurIn from "@/components/ui/blur-in";
// import TypingAnimation from "@/components/ui/typing-animation";
import { Link } from "@/navigation";
import { connectionIdToColor } from "@/utils";

export default function Cursor({
  x,
  y,
  name,
  connectionId,
  duration,
}: {
  x: number;
  y: number;
  name: string;
  connectionId: number;
  duration?: number;
}) {
  return (
    <div
      style={{
        transform: `translateX(${x}px) translateY(${y}px)`,
      }}
      className={`${name == "You" ? "" : `transition-all duration-${duration}00 ease-in-out`} drop-shadow-md absolute`}
    >
      <MousePointer2
        className="h-5 w-5"
        style={{
          fill: connectionIdToColor(connectionId),
          color: connectionIdToColor(connectionId),
        }}
      />
      <div
        className="absolute left-5 px-1.5 py-0.5 rounded-md text-xs text-white font-semibold"
        style={{
          backgroundColor: connectionIdToColor(connectionId),
        }}
      >
        {name}
      </div>
    </div>
  );
}

function Hero() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start end", "end start"],
  });
  const translateY = useTransform(scrollYProgress, [0, 1.5], [900, -120]);

  const [cursorVisible, setCursorVisible] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  const handleMouseEnter = () => setCursorVisible(true);
  const handleMouseLeave = () => setCursorVisible(false);

  const handleMouseMove = (event: MouseEvent) => {
    // {{ edit_5 }}
    setCursorPosition({ x: event.clientX, y: event.clientY });
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

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

  const userMindmapDetails: MindMapDetailsProps = {
    id: "1",
    organizationId: "e84e5e4e-92d7-4155-acaa-710651926451",
    layers: [
      {
        type: "RECTANGLE",
        dbId: "c16a5e48-0fdb-44d2-83b8-0bfe871fa442",
        id: "TMJODR6ULEbV9AXQKtj140",
        x: 601,
        y: 316,
        height: 60,
        width: 200,
        fill: {
          r: 77,
          g: 106,
          b: 255,
        },
        value: "Text",
        valueStyle: null,
        borderColor: null,
        borderWidth: null,
        borderType: null,
        rectangleGoodText: null,
      },
    ],
    edges: [],
    name: "PRIVATE DON'T JOIN",
    description: "",
    creatorId: "6bfc0d55-6b20-43cd-917d-3cc59e8c6eb9",
    creatorUsername: "emji",
    pictureUrl: "",
    connectedMemberPermissions: ["VIEW", "UPDATE", "DELETE", "SHARE", "EXPORT", "IMPORT", "COPY", "MANAGE_ROLES"],
    visibility: "PRIVATE",
    members: [
      {
        userId: "410f2265-78c1-4eab-892a-9d432198b666",
        memberId: "6bfc0d55-6b20-43cd-917d-3cc59e8c6eb9",
        username: "emji",
        email: "emji@yopmail.com",
        mindmapRole: "CREATOR",
        organizationRole: "ADMIN",
      },
    ],
    teams: [],
  };

  return (
    <section
      ref={heroRef}
      className={`${
        cursorVisible ? "!cursor-none" : "cursor-auto"
      } relative bg-[radial-gradient(ellipse_80%_40%_at_bottom,#C8CFFFFF,#FCFDFFFF_100%)] dark:bg-[radial-gradient(ellipse_50%_30%_at_bottom,#0627FF7F,#00000000_100%)] pb-20 pt-32 md:overflow-x-clip md:pb-10 md:pt-32 h-[100vh]`}
    >
      <div className="container">
        <figure className="absolute top-0 left-0 w-full h-full bg-blue">
          <Whiteboard userMindmapDetails={userMindmapDetails} />
        </figure>
        <div className="md:flex flex-col md:items-center text-left md:text-center ">
          <div
            className="group md:w-[578px] my-6 relative transition-all duration-600 ease-in-out hover:border-2 border-primary-color hover:bg-[rgba(77,107,255,0.05)] backdrop-filter backdrop-blur-sm"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="hidden group-hover:block absolute -right-2 -top-2 w-4 h-4 rounded-[3px] bg-primary-color"></div>
            <div className="hidden group-hover:block absolute -left-2 -top-2 w-4 h-4 rounded-[3px] bg-primary-color"></div>
            <div className="hidden group-hover:block absolute -left-2 -bottom-2 w-4 h-4 rounded-[3px] bg-primary-color"></div>
            <div className="hidden group-hover:block absolute -right-2 -bottom-2 w-4 h-4 rounded-[3px] bg-primary-color"></div>
            {/* <div className="tag">Beta version </div> */}

            <h1 className="md:text-7xl bg-gradient-to-b from-black to-[#001e80] dark:from-white dark:to-[#C8CFFFFF] bg-clip-text text-5xl font-bold tracking-tighter text-transparent">
              Unleash Your Creativity with
            </h1>
            <BlurIn
              word="Mindgen"
              duration={0.3}
              className="md:text-7xl text-5xl font-bold text-primary-color text-left md:text-center"
            />

            <p className="mt-6 text-xl tracking-tight text-[#010d3e] dark:text-primary-foreground default">
              Transform your ideas into visual masterpieces with Mindgen. Collaborate seamlessly and generate
              professional documents in minutes!
            </p>

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
                <Cursor
                  x={cursorVisible ? cursorProps.onHoverX : cursorProps.x}
                  y={cursorVisible ? cursorProps.onHoverY : cursorProps.y}
                  name={cursorProps.name}
                  connectionId={cursorProps.connectionId}
                  duration={cursorProps.duration}
                />
              </motion.div>
            ))}

            <div className="mt-[30px] flex flex-col items-start md:items-center">
              <div className="space-x-4">
                <Link href={`/dashboard`}>
                  <Button className="w-auto !cursor-none">Start for free</Button>
                </Link>
                <Button className="gap-2 !cursor-none" variant={"outline"}>
                  <span>Learn more</span>
                  <MoveRight size={20} />
                </Button>
              </div>
            </div>
          </div>

          <motion.img
            src={productImage.src}
            alt="Noodle Image"
            width={1024}
            className="hidden md:absolute md:inset-0 md:mx-auto md:my-auto md:block"
            style={{ translateY, rotate: 0 }}
          />
        </div>
      </div>
      {cursorVisible && <Cursor x={cursorPosition.x + 10} y={cursorPosition.y - 570} name="You" connectionId={4} />}
    </section>
  );
}

export { Hero };
