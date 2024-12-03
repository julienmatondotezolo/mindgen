import { useEffect, useState } from "react";
import { remark } from "remark";
import html from "remark-html";

function RenderMarkdown({ markdownText }: { markdownText: string }) {
  const [textFormatted, setTextFormatted] = useState("");
  const [isHtmlContent, setIsHtmlContent] = useState(false);

  useEffect(() => {
    const processMarkdown = async (markdownText: string) => {
      try {
        // Extract content between triple backticks if present
        const backtickMatch = markdownText.match(/```(?:html)?\n([\s\S]*?)```/);

        if (backtickMatch) {
          const extractedContent = backtickMatch[1];

          setIsHtmlContent(extractedContent.includes("<!DOCTYPE html>"));
          setTextFormatted(extractedContent);
          return;
        }

        setIsHtmlContent(false);
        const result = await remark().use(html).process(markdownText);

        setTextFormatted(result.toString());
      } catch (error) {
        console.error("Error processing markdown:", error);
        return "[ERROR PROCESSING]";
      }
    };

    processMarkdown(markdownText);
  }, [markdownText]);

  // Use shadow DOM for HTML content
  if (isHtmlContent) {
    return (
      <div
        className="promptContainer"
        ref={(el) => {
          if (el && !el.shadowRoot) {
            const shadow = el.attachShadow({ mode: "open" });

            shadow.innerHTML = textFormatted;
          }
        }}
      />
    );
  }

  // Regular markdown rendering
  return <div className="promptContainer" dangerouslySetInnerHTML={{ __html: textFormatted }} />;
}

export { RenderMarkdown };
