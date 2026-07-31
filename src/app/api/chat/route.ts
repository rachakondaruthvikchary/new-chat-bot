import Groq from "groq-sdk";
import { createClient } from "@/lib/supabase/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODEL = "llama-3.3-70b-versatile";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { conversationId, messages } = (await request.json()) as {
    conversationId: string;
    messages: { role: "user" | "assistant"; content: string }[];
  };

  if (!conversationId || !messages?.length) {
    return new Response("Missing conversationId or messages", {
      status: 400,
    });
  }

  // Verify the conversation belongs to this user before doing anything else
  const { data: conversation } = await supabase
    .from("conversations")
    .select("id")
    .eq("id", conversationId)
    .eq("user_id", user.id)
    .single();

  if (!conversation) {
    return new Response("Conversation not found", { status: 404 });
  }

  const lastUserMessage = messages[messages.length - 1];

  // Persist the user's message immediately
  await supabase.from("messages").insert({
    conversation_id: conversationId,
    role: "user",
    content: lastUserMessage.content,
  });

  const stream = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content:
          "You are Converge, a clear and concise AI assistant. Give direct, well-structured answers.",
      },
      ...messages,
    ],
    stream: true,
  });

  const encoder = new TextEncoder();
  let fullResponse = "";

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content || "";
          if (delta) {
            fullResponse += delta;
            controller.enqueue(encoder.encode(delta));
          }
        }
      } catch (err) {
        controller.error(err);
        return;
      }

      // Persist the assistant's full response once streaming finishes
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        role: "assistant",
        content: fullResponse,
      });

      // Auto-title new conversations from the first user message
      if (messages.length === 1) {
        const title = lastUserMessage.content.slice(0, 60);
        await supabase
          .from("conversations")
          .update({ title, updated_at: new Date().toISOString() })
          .eq("id", conversationId);
      } else {
        await supabase
          .from("conversations")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", conversationId);
      }

      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
