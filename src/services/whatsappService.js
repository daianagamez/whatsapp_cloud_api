import axios from 'axios';
import config from '../config/env.js';

class WhatsAppService {
    //Enviar Mensaje de Texto
    async sendMessage(to, body, messageId) {
        try {
        await axios({
            method: 'POST',
            url: `https://graph.facebook.com/${config.API_VERSION}/${config.BUSINESS_PHONE}/messages`,
            headers: {
            Authorization: `Bearer ${config.API_TOKEN}`,
            },
            data: {
            messaging_product: 'whatsapp',
            to,
            text: { body },
            /*context: { //Esto es para replicar el mensaje/responder sobre el msm
                message_id: messageId,
            },*/
            },
        });
        } catch (error) {
        console.error('Error sending message:', error);
        }
    }
    //Marcar el mensaje como Leido
    async markAsRead(messageId) {
        try {
        await axios({
            method: 'POST',
            url: `https://graph.facebook.com/${config.API_VERSION}/${config.BUSINESS_PHONE}/messages`,
            headers: {
            Authorization: `Bearer ${config.API_TOKEN}`,
            },
            data: {
            messaging_product: 'whatsapp',
            status: 'read',
            message_id: messageId,
            },
        });
        } catch (error) {
        console.error('Error marking message as read:', error);
        }
    }
    //Enviar mensajes tipo boton
    async sendInteractiveButtons(to, bodyText, buttons){
        try{
            await axios({
                method: 'POST',
                url: `https://graph.facebook.com/${config.API_VERSION}/${config.BUSINESS_PHONE}/messages`,
                headers: {
                  Authorization: `Bearer ${config.API_TOKEN}`,
                },
                data: {
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
                },
            });

        }catch(e){
            console.error("Error al enviar msm button: ", e)
        }
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

            const mensaje = await axios({
                method: 'POST',
                url: `https://graph.facebook.com/${config.API_VERSION}/${config.BUSINESS_PHONE}/messages`,
                headers: {
                    Authorization: `Bearer ${config.API_TOKEN}`,
                },
                data: {
                    messaging_product: 'whatsapp',
                    to,
                    type: type,
                    ...mediaObject
                },
            });

        }catch(e){
            console.error("Error sending media", e)
        }
    }
}

export default new WhatsAppService();