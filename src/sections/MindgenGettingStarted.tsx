import { motion } from "framer-motion";
import Image from "next/image";
import React from "react";
import { useSetRecoilState } from "recoil";

import productImage from "@/assets/section/hero.gif";
import { globalCursorState } from "@/state";

function MindgenGettingStarted() {
  // const landingText = useTranslations("landing");

  const setCursorVisible = useSetRecoilState(globalCursorState);

  const handleMouseEnter = () => setCursorVisible(true);
  const handleMouseLeave = () => setCursorVisible(false);

  const feautures = [
    {
      name: "Step 1: Connect Your Data Sources",
      description: "Easily integrate your GitHub repos, CSV files, and more.",
    },
    {
      name: "Step 2: Create Your Mindmap or Flowchart",
      description: "Utilize our intuitive interface to visualize your ideas.",
    },
    {
      name: "Step 3: Collaborate and Generate Insights",
      description: "Work with your team to generate user stories and summaries.",
    },
  ];

  return (
    <section className="relative pt-56 bg-[radial-gradient(ellipse_80%_40%_at_bottom,#C8CFFFFF,#FCFDFFFF_100%)] dark:bg-[radial-gradient(ellipse_50%_30%_at_bottom,#0627FF7F,#00000000_100%)] md:overflow-x-clip">
      <div className="max-w-7xl w-[90%] m-auto">
        <section className="flex flex-col w-full m-auto space-y-20">
          <article className="w-[50%] m-auto">
            <h2 className="landingFeatureTitle m-auto w-[90%]">Getting Started with Mindgen Made Easy</h2>
            <p className="landingFeatureDescription">
              Mindgen simplifies the process of transforming external data into visual formats. With just a few clicks,
              you can create collaborative whiteboards and flowcharts that enhance your project planning.
            </p>
          </article>
          <div className="grid grid-cols-3 gap-20 w-full">
            {feautures.map((feauture, index) => (
              <div
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                key={index}
                className="card w-full box-content"
              >
                <figure className="bg-red-500 rounded-xl overflow-hidden">
                  <motion.div className="relative w-fill" whileHover={{ scale: 1.2 }} transition={{ duration: 0.3 }}>
                    <Image
                      src={productImage}
                      alt="product_image"
                      className="scale-110"
                      // layout="fill"
                      height={3000}
                      objectFit="contain"
                    />
                  </motion.div>
                </figure>
                <article className="space-y-2">
                  <p className="landingFeatureDescription font-medium">{feauture.name}</p>
                  <p className="text-center">{feauture.description}</p>
                </article>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

export { MindgenGettingStarted };
