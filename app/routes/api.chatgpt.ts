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

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const messages = formData.get("messages") as string;
  const file = formData.get("file") as File;
  const assistantID = "asst_f1s1H1GvrhYXlUw2Lt6OxZwA";

  let responseText = '';
  try {
    const userId = await getAuthFromRequest(request);

    if (!userId) {
      return json({ error: 'User not authenticated' }, { status: 401 });
    }

    const userProfile = await getUserProfile(request);
    const contractDetails = await getUserDetails(request);
    const userContractDetails = await fetchUserContractDetails(request);

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

    let fileId = '';
    let filePurpose = '';

    if (file) {
      const allowedFileTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      const maxSize = 10 * 1024 * 1024; // 10 MB

      if (!allowedFileTypes.includes(file.type)) {
        return json({ error: 'Unsupported file type' }, { status: 400 });
      }
      if (file.size > maxSize) {
        return json({ error: 'File is too large' }, { status: 400 });
      }

      const uploadsDir = path.join(__dirname, 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir);
      }

      const filePath = path.join(uploadsDir, file.name);
      fs.writeFileSync(filePath, Buffer.from(await file.arrayBuffer()));

      if (!fs.existsSync(filePath)) {
        return json({ error: 'Failed to write file to disk' }, { status: 500 });
      }

      if (file.type.startsWith('image/')) {
        filePurpose = 'vision';
      } else {
        filePurpose = 'assistants';
      }

      const fileUploadResponse = await openai.files.create({
        file: fs.createReadStream(filePath),
        purpose: filePurpose,
      });
      fileId = fileUploadResponse.id;

      if (!fileId) {
        return json({ error: 'Failed to upload file to OpenAI' }, { status: 500 });
      }
    }

    let messagePayload: MessageCreateParams = {
      role: "user",
      content: [{ type: "text", text: `${messages}` }],
    };

    if (contractDetails?.preferUpload) {
      if (fileId) {
        if (filePurpose === 'vision') {
          messagePayload.content = [
            { "type": "text", "text": `${messages}` },
            {
              type: 'image_file',
              image_file: {
                file_id: fileId,
              },
            }
          ];
          messagePayload.attachments = [{
            file_id: contractDetails?.laborLifeFile?.toString(),
            tools: [{ type: "file_search" }]
          }, {
            file_id: contractDetails?.payrollFile?.toString(),
            tools: [{ type: "file_search" }]
          }, {
            file_id: contractDetails?.contractFile?.toString(),
            tools: [{ type: "file_search" }],
          }];
        } else {
          messagePayload.attachments = [{
            file_id: contractDetails?.laborLifeFile?.toString(),
            tools: [{ type: "file_search" }]
          }, {
            file_id: contractDetails?.payrollFile?.toString(),
            tools: [{ type: "file_search" }]
          }, {
            file_id: contractDetails?.contractFile?.toString(),
            tools: [{ type: "file_search" }]
          }, {
            file_id: fileId,
            tools: [{ type: "file_search" }]
          }];
        }
      } else {
        messagePayload.attachments = [{
          file_id: contractDetails?.laborLifeFile?.toString(),
          tools: [{ type: "file_search" }]
        }, {
          file_id: contractDetails?.payrollFile?.toString(),
          tools: [{ type: "file_search" }]
        }, {
          file_id: contractDetails?.contractFile?.toString(),
          tools: [{ type: "file_search" }]
        }];
      }
    } else {
      if (fileId) {
        if (filePurpose === 'vision') {
          messagePayload.content = [
            { "type": "text", "text": `${messages}` },
            {
              type: 'image_file',
              image_file: {
                file_id: fileId,
              },
            }
          ];
        } else {
          messagePayload.attachments = [{
            file_id: fileId,
            tools: [{ type: "file_search" }]
          }];
        }
      }
    }

    let threadId = user.threadId;
    if (!threadId) {
      const thread = await openai.beta.threads.create();
      threadId = thread.id;

      await prisma.user.update({
        where: { id: parseInt(userId) },
        data: { threadId: threadId },
      });
    }

    await openai.beta.threads.messages.create(
      threadId,
      messagePayload
    );

    const stream = openai.beta.threads.runs.stream(threadId, {
      assistant_id: assistantID,
      instructions: contractDetails?.preferUpload ?
        `##(IMPORTANTE!!)Si se necesita Información del Usuario tomate tu tiempo para buscar y examinar los 3 archivos de attachments con calma y intenga leer cada palabra y ten cuidado con los posibles errores o preguntas trampa como pedir informacion que no existe en los documentos si no hay informacion di que no hay.` : ` Información del Usuario:      Nombre: ${userProfile.firstName} ${userProfile.lastName},
      Correo Electrónico: ${userProfile.email},
      Biografía: ${userProfile.bio},
      Género: ${userProfile.gender},
      Cumpleaños: ${userProfile.birthday}
      Detalles del Contrato:
      ${JSON.stringify(contractDetails)}
      Detalles del Contrato del Usuario:
      ${JSON.stringify(userContractDetails)}
      `
    });

    for await (const event of stream) {
      if (event.data.object.toString() === 'thread.message.delta') {
        responseText += event.data.delta.content[0].text.value;

        responseText = responseText.replace(/[\*\#]+/g, '');
        responseText = responseText.replace(/([a-zA-Z])(\d+)/g, '$1 $2');
        responseText = responseText.replace(/:/g, ': ');
        responseText = responseText.replace(/-(?=\w)/g, ' ');
        responseText = responseText.replace(/【.*?】/g, ' ');
        responseText = responseText.replace(/\.(\D)/g, '. $1');

        // Reemplaza las fórmulas matemáticas con texto legible
        responseText = responseText.replace(/\\frac{(\d+)}{(\d+)}/g, '($1/$2)');
        responseText = responseText.replace(/\\times/g, 'x');
        responseText = responseText.replace(/\\left/g, '(');
        responseText = responseText.replace(/\\right/g, ')');
        responseText = responseText.replace(/\\text{(\w+)}/g, '$1');
        responseText = responseText.replace(/\\\[/g, '');
        responseText = responseText.replace(/\\\]/g, '');
        responseText = responseText.replace(/\\\(/g, '');
        responseText = responseText.replace(/\\\)/g, '');
        responseText = responseText.replace(/\\approx/g, '≈');
        responseText = responseText.replace(/\\text{(.*?)}/g, '$1'); // Nueva regla para eliminar \text{}
        responseText = responseText.replace(/\\mathbf{(.*?)}/g, '$1'); // Nueva regla para eliminar \mathbf{}
        responseText = responseText.replace(/\\frac{(\d+)}{(\d+)}/g, '($1/$2)');
        responseText = responseText.replace(/\\\(/g, '(');
        responseText = responseText.replace(/\\\)/g, ')');
        responseText = responseText.replace(/\\días/g, ' días');
        responseText = responseText.replace(/\\EUR/g, ' EUR');
        responseText = responseText.replace(/\\times/g, 'x'); // Reemplaza \times con x
        responseText = responseText.replace(/\\,€/g, '€'); // Elimina \, antes del símbolo de euro
        responseText = responseText.replace(/\\/g, '');

        emitter.emit("message", {
          id: threadId,
          userId: user.id,
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
};
