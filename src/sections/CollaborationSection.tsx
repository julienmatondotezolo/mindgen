import { motion, useScroll, useTransform } from "framer-motion";
import { Check } from "lucide-react";
import Image from "next/image";
import React, { useRef } from "react";
import { useSetRecoilState } from "recoil";

import productImage from "@/assets/section/hero.gif";
import { globalCursorState } from "@/state";

// function PromptTextInput() {
//   const size = 20;
//   const text = "Write your text our use a quick prompt.";

//   return (
//     <div className="relative flex justify-between items-center max-h-36 p-2 bg-white rounded-xl shadow-lg backdrop-filter backdrop-blur-lg dark:border dark:bg-slate-600 dark:bg-opacity-20 dark:border-slate-800">
//       {/* <p className="py-4 pl-4 w-[90%] dark:text-white">Write your text our use a quick prompt.</p> */}
//       <TypingAnimation className="py-4 pl-4 w-[90%] dark:text-white" text={text} />
//       <Button className="" size="icon">
//         <Image src={starsIcon} height={size} width={size} alt="Stars icon" />
//       </Button>
//     </div>
//   );
// }

function CollaborationSection() {
  const divRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: divRef,
    offset: ["start end", "end start"],
  });

  const translateX = useTransform(scrollYProgress, [0, 1], [-250, -150]);
  // const scale = useTransform(scrollYProgress, [0, 0.3], [0.2, 0.8]);
  const opacity = useTransform(scrollYProgress, [0, 0.1], [0.6, 1]);

  // const quickPromptTranslateY = useTransform(scrollYProgress, [0, 0.75], [50, -200]);
  // const promptTranslateY = useTransform(scrollYProgress, [0, 1], [0, -150]);

  const setCursorVisible = useSetRecoilState(globalCursorState);

  const handleMouseEnter = () => setCursorVisible(true);
  const handleMouseLeave = () => setCursorVisible(false);

  // const quickPrompts = [
  //   {
  //     name: "Summarize",
  //   },
  //   {
  //     name: "Generate Essay",
  //   },
  //   {
  //     name: "Create Proposal",
  //   },
  //   {
  //     name: "Create Document",
  //   },
  //   {
  //     name: "Create Website",
  //   },
  //   {
  //     name: "Write E-mail",
  //   },
  //   {
  //     name: "Create PDF",
  //   },
  //   {
  //     name: "Generate User Story",
  //   },
  // ];

  return (
    <section className="relative pt-56 bg-[radial-gradient(ellipse_80%_40%_at_top,#C8CFFFFF,#FCFDFFFF_100%)] dark:bg-[radial-gradient(ellipse_50%_30%_at_top,#0627FF7F,#00000000_100%)] md:overflow-x-clip">
      <div className="max-w-7xl w-[90%] m-auto">
        <article
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="relative border dark:border-slate-800 flex flex-row-reverse items-center bg-[rgba(77,107,255,0.05)] p-10 md:p-20 rounded-[50px] overflow-hidden"
        >
          <section className="w-fill md:w-1/2">
            <motion.div whileHover={{ scale: 0.95 }} transition={{ duration: 0.3 }}>
              <h2 className="landingFeatureTitle text-left">
                Seamless Collaboration: Work Together on Whiteboards and Flowcharts Effortlessly
              </h2>
              <p className="landingFeatureDescription text-left">
                Our collaboration features empower teams to brainstorm and visualize ideas in real-time. With intuitive
                tools, users can easily share, edit, and enhance flowcharts and whiteboards together.
              </p>
              <ul className="mt-8 flex flex-col gap-5">
                <li className="flex items-center gap-4 text-sm">
                  <Check size={20} />
                  <span>Real-time editing for instant feedback and improvements.</span>
                </li>
                <li className="flex items-center gap-4 text-sm">
                  <Check size={20} />
                  <span>Invite team members to collaborate with ease.</span>
                </li>
                <li className="flex items-center gap-4 text-sm">
                  <Check size={20} />
                  <span>Share your creations and gather valuable input.</span>
                </li>
              </ul>
            </motion.div>
          </section>
          <section className="relative w-fill md:w-1/2" ref={divRef}>
            <motion.div
              className="relative h-fill"
              style={{ translateX, opacity }}
              whileHover={{ scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src={productImage}
                alt="product_image"
                className="rounded-3xl scale-150"
                // layout="fill"
                height={3000}
                objectFit="contain"
              />
            </motion.div>
          </section>
          {/* <motion.aside
            className="absolute bottom-2 flex flex-wrap justify-between w-[500px] left-0"
            style={{ translateX: "30%", translateY: quickPromptTranslateY, scale }}
          >
            {quickPrompts.map((item, index) => (
              <button
                key={index}
                className="border bg-white dark:bg-slate-900 dark:bg-opacity-80 dark:border-slate-800 px-4 py-2 w-fit rounded-full text-xs hover:bg-slate-200 dark:hover:bg-slate-700 whitespace-nowrap mb-2"
              >
                {item.name}
              </button>
            ))}
          </motion.aside>
          <motion.div
            className="absolute bottom-1 left-0 hidden md:block w-[500px]"
            style={{ translateX: "30%", translateY: promptTranslateY, scale }}
          >
            <PromptTextInput />
          </motion.div> */}
        </article>
      </div>
    </section>
  );
}

export { CollaborationSection };
