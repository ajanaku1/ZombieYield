import React from "react";
import { Composition } from "remotion";
import { ZombieYieldVideo } from "./ZombieYieldVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ZombieYieldPresentation"
        component={ZombieYieldVideo}
        durationInFrames={2700}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
