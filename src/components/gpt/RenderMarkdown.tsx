import { useEffect, useState } from "react";
import { remark } from "remark";
import html from "remark-html";

function RenderMarkdown({ markdownText }: { markdownText: string }) {
  const [textFormatted, setTextFormatted] = useState("");
  const [isHtmlContent, setIsHtmlContent] = useState(false);

  useEffect(() => {
    const processMarkdown = async (markdownText: string) => {
      try {
        // Check if content is HTML
        if (markdownText.trim().startsWith("```html") && markdownText.includes("</html>")) {
          setIsHtmlContent(true);
          // Extract HTML content between ```html and ``` tags
          const htmlContent = markdownText.split("```html")[1].split("```")[0].trim();

          setTextFormatted(htmlContent);
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
