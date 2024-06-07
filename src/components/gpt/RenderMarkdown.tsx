import { useEffect, useState } from "react";
import { remark } from "remark";
import html from "remark-html";

function RenderMarkdown({ markdownText }: { markdownText: string }) {
  const [textFormatted, setTextFormatted] = useState("");

  useEffect(() => {
    const processMarkdown = async (markdownText: string) => {
      try {
        const result = await remark().use(html).process(markdownText);

        setTextFormatted(result.toString());
      } catch (error) {
        console.error("Error processing markdown:", error);
        return "[ERROR PROCESSING]";
      }
    };

    processMarkdown(markdownText);
  }, [markdownText]);

  return <div dangerouslySetInnerHTML={{ __html: textFormatted }} />;
}

export { RenderMarkdown };
