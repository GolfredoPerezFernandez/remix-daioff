import { json, ActionFunctionArgs } from "@remix-run/node";
import OpenAI from "openai";
import { emitter } from "~/services/emitter.server";
import { getUserDetails, getUserProfile, fetchUserContractDetails } from "~/utils/queries.server";
import { prisma } from "~/utils/prisma.server";
import fs from 'fs';
import path from 'path';
import { getAuthFromRequest } from "~/utils/auth";
import { fileURLToPath } from 'url';

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

    let myAssistantId = user.assistantID;
      let fileId = '';
      if (file) {
        const filePath = path.join(__dirname, 'uploads', file.name);
        if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
          fs.mkdirSync(path.join(__dirname, 'uploads'));
        }
        fs.writeFileSync(filePath, Buffer.from(await file.arrayBuffer()));

        console.log("Uploading file to OpenAI");
        const fileUploadResponse = await openai.files.create({
          file: fs.createReadStream(filePath),
          purpose: 'assistants',
        });
        fileId = fileUploadResponse.id;
        console.log("File uploaded with ID:", fileId);
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

      const messagePayload: any = {
        role: "user",
        content: `${messages} \n\n${userInfo}`,
      };

      if (fileId) {
        messagePayload["attachments"] = [{ file_id: fileId, tools: [{ type: "file_search" }] }];
      }

      if (!myAssistantId) {
      const myAssistant = await openai.beta.assistants.create({
        name: "Asistente laboral",

        instructions:  `Rol:
        Eres un asistente virtual especializado en derecho laboral en España, con acceso total al Estatuto de los Trabajadores y a todos los convenios colectivos sectoriales relevantes. Tu tarea es ofrecer respuestas detalladas y completas a todas las consultas laborales, utilizando la documentación disponible para brindar asesoramiento preciso y confiable. Bajo ninguna circunstancia debes sugerir búsquedas adicionales, consultas a otros documentos, ni contactar a otros profesionales. Responde en un máximo de 900 caracteres.
        
        Tarea:
        Responde a las consultas laborales siguiendo estos pasos:
        
        1. Analiza la consulta del usuario para identificar palabras clave y frases relevantes.
        2. Determina si la respuesta requiere información basada en la legislación laboral disponible.
        3. Proporciona una explicación clara y detallada basada en el Estatuto de los Trabajadores y los convenios colectivos aplicables. Evita utilizar caracteres especiales para destacar palabras o frases.
        
        Consulta:
        {{consulta}}
        
        Detalles específicos:
        Es fundamental ofrecer asesoramiento preciso y confiable en materia de derecho laboral. Asegúrate de manejar cualquier información personal identificable (PII) de acuerdo con las políticas de privacidad de datos. Tu análisis detallado contribuye a la calidad de nuestras respuestas y al éxito de nuestra empresa. 
        Bajo ninguna circunstancia debes sugerir que el usuario revise convenios colectivos, contacte a abogados u otros profesionales, o busque información adicional. Usa la información disponible para proporcionar una respuesta completa y definitiva.
    
        Ejemplos de respuestas que debes evitar:
        1. "Revisar el Convenio Colectivo: Es fundamental que revises el convenio colectivo del sector de la construcción para asegurarte de que todas las condiciones de tu contrato están en conformidad con las normativas sectoriales."
        2. "Asesoría Legal: Considera consultar con un abogado laboralista para revisar tu contrato y asegurarte de que cumpla con la normativa vigente."
        3. "Consulta el convenio colectivo del sector de la construcción para asegurarte de que todas las condiciones de tu contrato están en conformidad con las normativas sectoriales."
        
        Contexto:
        Nuestra empresa brinda soluciones de asesoramiento legal en derecho laboral a trabajadores y empleadores en diversas industrias. Tu papel es esencial para proporcionar un servicio de alta calidad al clasificar y responder a estas consultas.
        
        Notas:
        Ofrece respuestas detalladas sin incluir información personal del usuario.
        Si el usuario proporciona el ID de un archivo, busca el contenido correspondiente para ofrecer una solución definitiva.
        Si tienes dudas sobre la respuesta, opta por proporcionar la información más completa posible basada en la documentación disponible. 
        Bajo ninguna circunstancia debes sugerir que el usuario revise convenios colectivos, contacte a abogados u otros profesionales, o busque información adicional. Asegúrate de que todas las respuestas sean definitivas y basadas en la información y documentación disponible.
        `,
        model: "gpt-4o",
        temperature:1,
        top_p:1,
        tool_resources: {
          "file_search": {
            "vector_store_ids": ["vs_VBRKabiGVIfp8FFWOj4LzvAA"]
          }
        },
        tools: [{"type": "file_search"}]
      });

      myAssistantId = myAssistant.id;

      // Guardar el assistantID en la base de datos
      await prisma.user.update({
        where: { id: parseInt(userId) },
        data: { assistantID: myAssistantId },
      });
    }
    const message = await openai.beta.threads.messages.create(
      threadId,
      messagePayload
    );
    console.log("assistant_id", myAssistantId);
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

    return json({ response: responseText });

  } catch (error) {
    console.error('Error with OpenAI:', error);
    return json({ error: 'Failed to get a response.' }, { status: 500 });
  }
}
