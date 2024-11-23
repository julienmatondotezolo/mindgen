import { motion } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "next-intl";
import React from "react";
import { useSetRecoilState } from "recoil";

import productImage from "@/assets/section/hero.gif";
import { globalCursorState } from "@/state";

function ImportFeaturesSection() {
  const landingText = useTranslations("landing");

  const setCursorVisible = useSetRecoilState(globalCursorState);

  const handleMouseEnter = () => setCursorVisible(true);
  const handleMouseLeave = () => setCursorVisible(false);

  const feautures = [
    {
      name: "writeQueryTitle",
      description: "writeQueryDescription",
    },
    {
      name: "uploadDocumentTitle",
      description: "uploadDocumentDescription",
    },
    {
      name: "connectExternalDataTitle",
      description: "connectExternalDataDescription",
    },
  ];

  return (
    <section className="relative pt-56 bg-[radial-gradient(ellipse_80%_40%_at_bottom,#C8CFFFFF,#FCFDFFFF_100%)] dark:bg-[radial-gradient(ellipse_50%_30%_at_bottom,#0627FF7F,#00000000_100%)] md:overflow-x-clip">
      <div className="max-w-7xl w-[90%] m-auto">
        <article className="flex flex-col w-full m-auto space-y-20">
          <h2 className="landingFeatureTitle m-auto w-[50%]">
            Unlock Your Creativity with Our Powerful Data Import Features
          </h2>
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
                <article className="space-y-4">
                  <p className="landingFeatureDescription font-medium">{landingText(feauture.name)}</p>
                  <p className="text-center">{landingText(feauture.description)}</p>
                </article>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

export { ImportFeaturesSection };
