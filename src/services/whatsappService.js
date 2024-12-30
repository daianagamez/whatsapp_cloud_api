import sendToWhatsApp from "../services/httpRequest/sendToWhatsApp.js";

class WhatsAppService {
    //Enviar Mensaje de Texto
    async sendMessage(to, body, messageId) {
        const data = {
            messaging_product: 'whatsapp',
            to,
            text: { body },
        };

        await sendToWhatsApp(data);
    }
    
    //Marcar el mensaje como Leido
    async markAsRead(messageId) {
        const data = {
            messaging_product: 'whatsapp',
            status: 'read',
            message_id: messageId,
        }

        await sendToWhatsApp(data)
    }
    
    //Enviar mensajes tipo boton
    async sendInteractiveButtons(to, bodyText, buttons){
        const data = {
            messaging_product: 'whatsapp',
            to,
            type: 'interactive',
            interactive: {
              type: 'button',
              body: { text: bodyText },
              action: {
                buttons: buttons
              }
            }
        }

        await sendToWhatsApp(data)
    }

    //Enviar Mensajes Multimedia y mapa
    async sendMediaMessage(to, type, mediaUrl, caption, filename, latitude, longitude, name, address){
        try{
            const mediaObject ={};

            //identificar tipo de msg
            switch(type){
                case "image":
                    mediaObject.image = {link: mediaUrl, caption: caption}
                    break;
                case "audio":  
                    mediaObject.audio = {link:mediaUrl}
                    break;
                case "video":
                    mediaObject.video = {link: mediaUrl}
                    break;
                case "document":
                    mediaObject.document = {link: mediaUrl, caption: caption, filename: filename}
                    break;
                case "location":
                    mediaObject.location = {latitude: latitude, longitude: longitude, name: name, address: address}
                    break;
                default:
                    throw new Error ("Not soported media type")
                    break;
            }

            const data = {
                messaging_product: 'whatsapp',
                to,
                type: type,
                ...mediaObject
            }

            await sendToWhatsApp(data);

        }catch(e){
            console.error("Error sending media", e)
        }
    }

    async sendContactMessage(to, contact) {
        const data = {
            messaging_product: 'whatsapp',
            to,
            type: 'contacts',
            contacts: [contact]
        }

        await sendToWhatsApp(data)
    }
}

export default new WhatsAppService();