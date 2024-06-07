import { useEffect, useState } from "react";
import { remark } from "remark";
import html from "remark-html";

function RenderMarkdown({ markdownText }: { markdownText: string }) {
  const [textFormatted, setTextFormatted] = useState("");

  useEffect(() => {
    const processMarkdown = async (markdownText: string) => {
      try {
        const result = await remark().use(html).process(markdownText);

        // Get the raw HTML string
        let htmlString = result.toString();

        // Replace line breaks with <br /> tags
        htmlString = htmlString.replace(/\n/g, "<br />");

        setTextFormatted(htmlString);
      } catch (error) {
        console.error("Error processing markdown:", error);
        return "[ERROR PROCESSING]";
      }
    };

    processMarkdown(markdownText);
  }, [markdownText]);

  return <div className="promptContainer" dangerouslySetInnerHTML={{ __html: textFormatted }} />;
}

export { RenderMarkdown };
