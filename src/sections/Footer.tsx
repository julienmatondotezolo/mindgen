"use client";

// import Logo from "@/assets/logosaas.png";
import Image from "next/image";

import SocialInsta from "@/assets/socials/social-insta.svg";
import SocialLinkedIn from "@/assets/socials/social-linkedin.svg";
import SocialX from "@/assets/socials/social-x.svg";
import SocialYoutube from "@/assets/socials/social-youtube.svg";

function Footer() {
  const size = 30;

  return (
    <footer className="bg-black py-10 text-center text-sm text-[#BCBCBC]">
      <div className="container">
        {/* <div className="before:content-[' '] relative inline-flex before:absolute before:bottom-0 before:top-2 before:w-full before:bg-[linear-gradient(to_right,#F87BFF,#FB92CF,#FFDD98,#C2F0B1,#2FD8FE)] before:blur">
          <Image src={Logo} alt="Sass Logo" height={40} className="relative" />
          <p>Add logo here</p>
        </div> */}
        <div className="mt-6 flex justify-center gap-6">
          <Image
            src={SocialX}
            height={size}
            width={size}
            className="cursor-pointer brightness-0 invert"
            alt="Stars icon"
          />
          <Image
            src={SocialYoutube}
            height={size}
            width={size}
            className="cursor-pointer brightness-0 invert"
            alt="Stars icon"
          />
          <Image
            src={SocialInsta}
            height={size}
            width={size}
            className="cursor-pointer brightness-0 invert"
            alt="Stars icon"
          />
          <Image
            src={SocialLinkedIn}
            height={size}
            width={size}
            className="cursor-pointer brightness-0 invert"
            alt="Stars icon"
          />
        </div>
        <p className="mt-6">&copy; 2024 Mindgen, Inc. All rights reserved.</p>
      </div>
    </footer>
  );
}

export { Footer };
