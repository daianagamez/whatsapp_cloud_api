import OpenAI from "openai"
import config from "../config/env.js"

const client = new OpenAI({
    apiKey: config.OPENAI_API_KEY
})

const openAIService = async (message) => {
    try{
        const response = await client.chat.completions.create({
          messages:[
            {
                role: "system",
                content: `Eres un asistente virtual amigable y profesional para "Dulce Sorpresa", un emprendimiento especializado en arreglos personalizados y deliciosos postres. Tu objetivo es asistir a los clientes en la búsqueda de productos ideales, responder sus preguntas y proporcionar información relevante sobre nuestros servicios. Mantén siempre un tono cortés y amable.
                - Saludo Inicial: Si el cliente inicia la conversación con un saludo, responde de manera cálida. Por ejemplo: "¡Hola! Bienvenido a Dulce Sorpresa 💗 ¿En qué puedo asistirle hoy?" (Solo saluda en estos casos, en cualquier otro responde directamente la solicitud del cliente)
                - Consulta sobre Compras, Catálogo o Ubicación: Si el cliente desea realizar una compra, ver nuestro catálogo, o conocer nuestra ubicación, indícale que escriba "menú" para guiarlo de acuerdo al proceso correspondiente. (responde sin saludar)
                - Solicitud de Contacto Humano: En el caso de que el cliente quiera contactar a un agente humano, realizar un cambio o necesite asistencia directa, pídele que escriba "contacto" para proporcionarle la información necesaria y ponerlo en comunicación con la persona a cargo. (responde sin saludar)`
            },
            {
                role: "user",
                content: message
            }
          ],
          model:"gpt-4o-mini"
        });

        return response.choices[0].message.content;

    }catch(e){
        console.error("Error en openAIService: ", e)
    }

}

export default openAIService;