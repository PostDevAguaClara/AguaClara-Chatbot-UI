import { createUIMessageStream, createUIMessageStreamResponse } from "ai";

const CHAT_URL = "https://qme4rjba60.execute-api.us-east-2.amazonaws.com/prod/";
const CITATIONS_HEADER = "=-=-=-=-=-=-=- Sources -=-=-=-=-=-=-=\n\n";

function cleanQuote(text : string) {
    return text
        .replace(/\r\n?/g, "\n")          // Normalize line endings
        .split("\n")
        .map(line => line.trim())         // Remove leading/trailing whitespace
        .filter(line => line.length > 0)  // Remove blank lines
        .join("\n")
        .replace(/\n{3,}/g, "\n\n")       // At most one blank line
        .trim();
}

function blockQuote(text : string, maxLength = 512) {
    if (text.length > maxLength) {
      const end = text.lastIndexOf(" ", maxLength);
      text = text.substring(0, end > 0 ? end : maxLength) + "...";
    }
    return text
        .split("\n")
        .map(line => `> ${line}`)
        .join("\n");
}

function removeCitations(text : string) {
  const citationIndex = text.indexOf(CITATIONS_HEADER);
  if (citationIndex === -1) { return text; }
  return text.substring(0, citationIndex).trim();
}

export async function POST(req: Request) {
  const { messages } = await req.json();

  const lastMessage = messages.at(-1)?.parts?.[0]?.text;
  
  const conversation = messages.map((message: any) => ({
      role: message.role,
      content: removeCitations(
          message.parts
          ?.filter((part: any) => part.type === "text")
          .map((part: any) => part.text)
          .join("") ?? "",
      )
  })).filter((message: any) => message.content.length > 0);

  console.log("Last Message: ", lastMessage);
  console.log("Conversation: ", JSON.stringify(conversation, null, 2));

  const response = await fetch(CHAT_URL,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lastMessage, conversation })
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
    message += CITATIONS_HEADER;
    for (const source of sources.values()) {
      message += `📁 ${source.path}\n\n`;
      message += `🔗 ${source.url}\n\n`;
      message += `Excerpts: \n\n`;
      for (const quote of source.quotes) {
        message += `${blockQuote(cleanQuote(quote))}\n\n`
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