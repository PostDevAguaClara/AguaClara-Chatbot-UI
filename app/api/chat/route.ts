import { createUIMessageStream, createUIMessageStreamResponse } from "ai";

export async function POST(req: Request) {
  // Still parse the request so the frontend doesn't error
  const { messages } = await req.json();
  const lastMessage = messages.at(-1);
  const prompt = lastMessage?.parts?.[0]?.text;

  console.log("Prompt:", prompt);

  const response = await fetch(
    "https://wgyix93bfk.execute-api.us-east-2.amazonaws.com/prod/",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    }
  )
  const data = await response.json();
  console.log("Data:", JSON.stringify(data, null, 2));

  // Compile sources
  const sources = new Map<string, {
      name: string;
      url: string;
      path: string;
      quotes: string[];
    }
  >();
  for (const citation of data.citations ?? []) {
    const existing = sources.get(citation.name);

    if (existing) {
      // Avoid duplicate quotes
      if (!existing.quotes.includes(citation.quote)) {
        existing.quotes.push(citation.quote);
      }
    } 
    else {
      sources.set(citation.name, {
        name: citation.name,
        url: citation.url,
        path: citation.path,
        quotes: [citation.quote],
      });
    }
  }

  // Compile message
  let message = `${data.output}\n\n\n\n`;
  if (sources.size > 0) {
    message += `=-=-=-=-=-=-=- Sources -=-=-=-=-=-=-=\n\n`;
    for (const source of sources.values()) {
      message += `📁 ${source.path}\n\n`;
      message += `🔗 ${source.url}\n\n`;
      message += `Excerpts: \n\n`;
      for (const quote of source.quotes) {
        message += `> \"${quote}\"\n\n`
      }
      message += `\n\n=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n\n`;
    }
  }

  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      writer.write({
        type: "text-start",
        id: "assistant-response",
      });

      writer.write({
        type: "text-delta",
        id: "assistant-response",
        delta: message,
      });

      writer.write({
        type: "text-end",
        id: "assistant-response",
      });
    },
  });

  return createUIMessageStreamResponse({ stream });
}