import { motion, useScroll, useTransform } from "framer-motion";
import { MoveRight } from "lucide-react";
import React, { useRef } from "react";

import springImage from "@/assets/spring.png";
import starImage from "@/assets/star.png";
import { Button } from "@/components";
import { Link } from "@/navigation";

function SignUpSection() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const translateY = useTransform(scrollYProgress, [0, 1], [150, -150]);

  return (
    <section
      ref={sectionRef}
      className="relative py-56 bg-[radial-gradient(ellipse_80%_40%_at_bottom,#C8CFFFFF,#FCFDFFFF_100%)] dark:bg-[radial-gradient(ellipse_50%_30%_at_bottom,#0627FF7F,#00000000_100%)] md:overflow-x-clip"
    >
      <div className="flex flex-col items-center space-y-2">
        <div className="flex flex-col relative">
          <h2 className="landingFeatureTitle">Sign up for free today</h2>
          <article className="w-3/4 m-auto py-4">
            <p className="landingFeatureDescription">
              Celebrate the joy of accomplishment with an app designed to track your progress and motivate your efforts.
            </p>
          </article>
          <motion.img
            src={starImage.src}
            alt="Star Image"
            width={360}
            className="absolute -left-[350px] -top-[137px]"
            style={{ translateY }}
          />
          <motion.img
            src={springImage.src}
            alt="Spring Image"
            width={360}
            className="absolute -right-[331px] -top-[19px]"
            style={{ translateY }}
          />
        </div>
        <div className="space-x-2">
          <Link href={`/dashboard`}>
            <Button className="w-auto !cursor-none">Start for free</Button>
          </Link>
          <Button className="gap-2 !cursor-none" variant={"outline"}>
            <span>Learn more</span>
            <MoveRight size={20} />
          </Button>
        </div>
      </div>
    </section>
  );
}

export { SignUpSection };
