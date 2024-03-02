export async function importMindmap(request: File) {
  try {
    // Assuming the file is sent as 'file' in the request body
    const fileContent = await request.text();

    // Parse the JSON content
    const jsonData = JSON.parse(fileContent);
    // Extract the required data
    const { nodes, edges } = jsonData;
    // Return the extracted data

    return { nodes, edges };
  } catch (error) {
    // Handle any errors that occur while reading the PDF
    console.error("Error processing file:", error);
    return { message: "Error processing file" };
  }
}
