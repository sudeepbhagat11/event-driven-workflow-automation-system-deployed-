"use client";
import { useRouter } from "next/navigation";
import { Feature } from "./Feature";
import { PrimaryButton } from "./buttons/PrimaryButton";
import { DarkButton } from "./buttons/DarkButton";
import { SecondaryButton } from "./buttons/SecondaryButton";

export const Hero = () => {
  const router = useRouter();
  return (
    <div>
      <div className="flex justify-center">
        <div className="text-5xl font-bold font-semibold text-center pt-8 max-w-xxl">
          Automate Your Workflow
        </div>
      </div>
      <div className="flex justify-center pt-2">
        <div className="text-xl font-bold font-normal text-center pt-8 max-w-2xl">
          AI gives you automation superpowers, and WorkFlow Automation puts them to work.
          Pairing AI and WorkFlow Automation helps you turn ideas into workflows 
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <div className="flex">
          <DarkButton
            onClick={() => {
              router.push("/signup");
            }}
            size="big"
          >
            Get Started free
          </DarkButton>
          
        </div>
      </div>

      {/* <div className="flex justify-center pt-4">
        <Feature title={"Free Forever"} subtitle={"for core features"} />
        <Feature title={"More apps"} subtitle={"than any other platforms"} />
        <Feature title={"Cutting Edge"} subtitle={"AI Features"} />
      </div> */}
    </div>
  );
};
