import whatsappService from './whatsappService.js';
class MessageHandler {
  async handleIncomingMessage(message, senderInfo) {
    if (message?.type === 'text') {
        //Validación de Saludo
        const incomingMessage = message.text.body.toLowerCase().trim();

        if(this.isGreeting(incomingMessage)){
            await this.sendWelcomeMessage(message.from, message.id, senderInfo);
            await this.sendWelcomeMenu(message.from)
        }else{
            const response = `Probandoooo: ${message.text.body}`;
            await whatsappService.sendMessage(message.from, response, message.id);
        }
        await whatsappService.markAsRead(message.id);
    }else if(message?.type === 'interactive'){
        //console.log("message?.interactive?: ", message?.interactive)
        const option = message?.interactive?.button_reply?.id
        await this.handlerMenuOption(message.from, option)
        await whatsappService.markAsRead(message.id);
    }
  }

  isGreeting(message){
    //validar que sea saludo de bienvenida
    const greetings = ["hola", "hello", "hi", "buenas tardes", "buenos dias", "holi"]
    return greetings.includes(message)
  }

  getSenderName(senderInfo){
    return senderInfo.profile?.name || senderInfo.wa_id || "";
  }

  nameFormat(name){
    //Eliminar emojis y caracteres especiales no alfabeticos
    const nameSinEmojis = name.replace(/[^a-zA-Z\s]/g, '');
    //Dividir el nombre el palabras
    const palabras = nameSinEmojis.split(' ');
    //Si hay más de una palabra "nombre y apellido", devolver solo la primera "nombre"
    return palabras.length > 1 ? palabras[0] : nameSinEmojis;

    //Validación con IA o en su defecto pedir directamente que devuelva el nombre
  }

  //Funcion para enviar mensaje de bienvenida
  async sendWelcomeMessage(to, messageId, senderInfo){
    console.log ("senderInfo: ", senderInfo);
    let name = this.getSenderName(senderInfo);
    name = this.nameFormat(name);
    const welcomeMessage = `Hola ${name}, bienvenido a Dulce Sorpresa 💗\n¿En qué puedo ayudarle hoy?`
    await whatsappService.sendMessage(to, welcomeMessage, messageId)
  }

  //Envio de menu inicial al usuario
  async sendWelcomeMenu(to){
    const menuMessage = "Elige una opción por favor"
    const buttons = [
        {
            type: 'reply', reply: {id: 'option1', title: 'Arreglos'}
        },
        {
            type: 'reply', reply: {id:'option2', title: 'Postres'}
        },
        {
            type: 'reply', reply: {id:'option3', title: 'Ubicación'}
        }
    ];
    await whatsappService.sendInteractiveButtons(to, menuMessage, buttons)
  }


  //Switch menu de opciones
  async handlerMenuOption(to, option){
    let response;
    switch(option){
        case "option1":
            response = "Solicitar arreglo"
            break;
        case "option2":
            response = "Pedir Postre"
            break;
        case "option3":
            response = "Esta es mi Ubicación"
            break;
        default:
            response = "Lo siento, no entendi tu seleccón. por favor, elige una de las opciones"
    }
    await whatsappService.sendMessage(to, response)
  }
}
export default new MessageHandler();