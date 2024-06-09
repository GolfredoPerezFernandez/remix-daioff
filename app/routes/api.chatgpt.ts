import { json, ActionFunctionArgs } from "@remix-run/node";
import OpenAI from "openai";
import { emitter } from "~/services/emitter.server";
import { getUserDetails, getUserProfile, fetchUserContractDetails } from "~/utils/queries.server";
import { prisma } from "~/utils/prisma.server";
import fs from 'fs';
import path from 'path';
import { getAuthFromRequest } from "~/utils/auth";
import { fileURLToPath } from 'url';
import { MessageCreateParams } from "openai/resources/beta/threads/messages.mjs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const messages = formData.get("messages") as string;
  const assistantID = formData.get("assistantID") as string;
  let vectorID = formData.get("vectorID") as string || 'default_vector_id';
  const file = formData.get("file") as File;

  console.log("Received assistantID:", assistantID);
  console.log("Received vectorID:", vectorID);

  if (file) {
    console.log("Received file:", file.name);
  } else {
    console.log("No file received");
  }

  let responseText = '';
  try {
    const userId = await getAuthFromRequest(request);

    if (!userId) {
      return json({ error: 'User not authenticated' }, { status: 401 });
    }

    const userProfile = await getUserProfile(request);
    const contractDetails = await getUserDetails(request);
    const userContractDetails = await fetchUserContractDetails(request);
    console.log("contractDetails :", contractDetails);
    console.log("userContractDetails :", userContractDetails);
    console.log("userProfile :", userProfile);

    console.log("userId :", JSON.stringify(userId));

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        threadId: true,
        assistantID: true,
      },
    });

    if (!user) {
      return json({ error: 'User not found in database' }, { status: 404 });
    }

    console.log("user :", JSON.stringify(user));
   // let myAssistantId = "asst_svjIMVKs8nHko600LkawLBRn";

  let myAssistantId = "asst_f1s1H1GvrhYXlUw2Lt6OxZwA";
    let fileId = '';

    if (file) {
      try {
        // Verificación del tipo de archivo y tamaño
        const allowedFileTypes = ['application/pdf', 'image/jpeg', 'image/png', 'text/plain']; // Ejemplo de tipos permitidos
        const maxSize = 10 * 1024 * 1024; // 10 MB

        if (!allowedFileTypes.includes(file.type)) {
          return json({ error: 'Unsupported file type' }, { status: 400 });
        }
        if (file.size > maxSize) {
          return json({ error: 'File is too large' }, { status: 400 });
        }

        const filePath = path.join(__dirname, 'uploads', file.name);
        if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
          fs.mkdirSync(path.join(__dirname, 'uploads'));
        }

        fs.writeFileSync(filePath, Buffer.from(await file.arrayBuffer()));

        // Verificación de que el archivo se haya escrito correctamente
        if (!fs.existsSync(filePath)) {
          return json({ error: 'Failed to write file to disk' }, { status: 500 });
        }

        console.log("Uploading file to OpenAI");
        const fileUploadResponse = await openai.files.create({
          file: fs.createReadStream(filePath),
          purpose: "assistants",
        });
        fileId = fileUploadResponse.id;

        // Verificación de que el archivo se haya subido correctamente a OpenAI
        if (!fileId) {
          return json({ error: 'Failed to upload file to OpenAI' }, { status: 500 });
        }

        console.log("File uploaded with ID:", fileId);
      } catch (uploadError) {
        console.error("Error uploading file:", uploadError);
        return json({ error: 'Failed to upload file' }, { status: 500 });
      }
    }

    const userInfo = ` User Info: 
    Name: ${userProfile.firstName} ${userProfile.lastName}, 
    Email: ${userProfile.email}, 
    Bio: ${userProfile.bio}, 
    Gender: ${userProfile.gender}, 
    Birthday: ${userProfile.birthday}
    Contract Details: 
    ${JSON.stringify(contractDetails)}
    User Contract Details: 
    ${JSON.stringify(userContractDetails)}
    `;
    console.log("userInfo", userInfo);

    let messagePayload: MessageCreateParams = {
      role: "user",
      content: fileId ? `Responde preguntas basadas en el documento ${ fileId} proporcionado. ${messages} \n\n${userInfo}` : `${messages} \n\n${userInfo}`,
    };

    if (fileId) {
      messagePayload.attachments = [
        {
          file_id: fileId,
          tools: [{ type: "file_search" }],
        },
      ];
    }

    let threadId = user.threadId;
    if (!threadId) {
      const thread = await openai.beta.threads.create();
      threadId = thread.id;
      console.log("New threadId:", threadId);

      await prisma.user.update({
        where: { id: parseInt(userId) },
        data: { threadId: threadId },
      });
    }
   await openai.beta.threads.messages.create(
      threadId,
      messagePayload
    );
    const stream = openai.beta.threads.runs.stream(threadId, { assistant_id: myAssistantId });

    for await (const event of stream) {
      if (event.data.object.toString() === 'thread.message.delta') {
        responseText += event.data.delta.content[0].text.value;

        // Limpieza del texto
        responseText = responseText.replace(/[\*\#]+/g, '');
        responseText = responseText.replace(/([a-zA-Z])(\d+)/g, '$1 $2');
        responseText = responseText.replace(/:/g, ': ');
        responseText = responseText.replace(/-(?=\w)/g, ' ');
        responseText = responseText.replace(/【.*?】/g, ' ');
        responseText = responseText.replace(/\.(\D)/g, '. $1');

        emitter.emit("message", {
          id: threadId,
          content: responseText,
          role: 'assistant',
        });
      }
    }

    return json({ response: responseText, fileId });

  } catch (error) {
    console.error('Error with OpenAI:', error);
    return json({ error: 'Failed to get a response.' }, { status: 500 });
  }
}
