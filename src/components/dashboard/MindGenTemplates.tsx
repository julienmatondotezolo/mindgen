import React from "react";

function MindGenTemplates() {
  // const templateText = useTranslations("Index");

  const flowchart =
    "https://images.ctfassets.net/qop92tnevinq/1lEYvPKjoo9uEifWosROJK/a280c582634b0731c2a6b4386485ef6d/Flowchart-thumb.svg";

  const mindmap =
    "https://images.ctfassets.net/qop92tnevinq/4ImlNeNIEoDGJYCFU5F3M3/e0822eef6c54e9ec6ca54fc7baa3d8b1/Mind_Map-thumb-2.svg";

  return (
    <div>
      <div className="p-6 rounded-2xl bg-[#f3f5f7] dark:bg-slate-500 dark:bg-opacity-20">
        <article className="grid sm:grid-cols-6 grid-cols-1 gap-8 w-full">
          <div className="float-left w-full">
            <figure
              className="gradientPrimary h-16 border-2 mb-2 dark:border-slate-800 rounded-xl"
              style={{
                backgroundImage: `url(${flowchart})`,
                backgroundSize: "cover",
                backgroundPosition: "center center",
                backgroundRepeat: "no-repeat",
              }}
            ></figure>
            <article>
              <p className="text-sm font-medium dark:text-white">Flow</p>
              {/* <p className="text-xs text-primary-color">{templateText("createdBy")} mindgen</p> */}
            </article>
          </div>

          <div className="float-left w-full">
            <figure
              className="gradientPrimary h-16 border-2 mb-2 dark:border-slate-800 rounded-xl"
              style={{
                backgroundImage: `url(${mindmap})`,
                backgroundSize: "cover",
                backgroundPosition: "center center",
                backgroundRepeat: "no-repeat",
              }}
            ></figure>
            <article>
              <p className="text-sm font-medium dark:text-white">Mindgen mind map</p>
              {/* <p className="text-xs text-primary-color">{templateText("createdBy")} mindgen</p> */}
            </article>
          </div>
        </article>
      </div>
    </div>
  );
}

export { MindGenTemplates };
