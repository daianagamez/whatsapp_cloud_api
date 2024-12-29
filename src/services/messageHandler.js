import whatsappService from './whatsappService.js';
import appendToSheet from './googleSheetsService.js';

class MessageHandler {

  constructor(){
    this.orderState ={};
  }

  async handleIncomingMessage(message, senderInfo) {
    if (message?.type === 'text') {
        //Validación de Saludo
        const incomingMessage = message.text.body.toLowerCase().trim();

        if(this.isGreeting(incomingMessage)){
            await this.sendWelcomeMessage(message.from, message.id, senderInfo);
            await this.sendWelcomeMenu(message.from)
        } else if(this.isMediaType(incomingMessage)){
          await this.sendMedia(message.from, incomingMessage)
        } else if(this.orderState[message.from]){
          await this.handleOrderFlow(message.from, incomingMessage)
        }
        else{
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

  isMediaType(message){
    const greetings = ["audio", "image", "video", "document"]
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
            type: 'reply', reply: {id: 'option1', title: 'Catálogo'}
        },
        {
            type: 'reply', reply: {id:'option2', title: 'Realizar Pedido'}
        },
        {
            type: 'reply', reply: {id:'option3', title: 'Ubicación'}
        }
    ];
    await whatsappService.sendInteractiveButtons(to, menuMessage, buttons)
  }

  //order options
  async sendOrderOption(to){
    const menuMessage = "¿Qué tipo de pedido deseas realizar?"
    const buttons = [
        {
            type: 'reply', reply: {id: 'order_option1', title: 'Arreglos'}
        },
        {
            type: 'reply', reply: {id:'order_option2', title: 'Postres'}
        },
    ];
    await whatsappService.sendInteractiveButtons(to, menuMessage, buttons)
  }

    //order options
    async sendCatalogOption(to){
      const menuMessage = "¿De cuál de nuestros servicios te gustaria obtener el catálogo?"
      const buttons = [
          {
              type: 'reply', reply: {id: 'catalog_option1', title: 'Arreglos'}
          },
          {
              type: 'reply', reply: {id:'catalog_option2', title: 'Postres'}
          },
      ];
      await whatsappService.sendInteractiveButtons(to, menuMessage, buttons)
    }

  //delivery options
  async sendDeliveryOption(to){
    const menuMessage = "¿Cómo desea retirar su pedido?"
    const buttons = [
        {
            type: 'reply', reply: {id: 'delivery_option1', title: 'Retiro en Tienda'}
        },
        {
            type: 'reply', reply: {id:'delivery_option2', title: 'Delivery'}
        },
    ];
    await whatsappService.sendInteractiveButtons(to, menuMessage, buttons)
  }


  //Switch menu de opciones
  async handlerMenuOption(to, option){
    let response;
    let urlCatalog; //Para pruebas se usan Urls temporales de canva :)
    switch(option){
        case "option1":
            response = "Catálogo"
            await this.sendCatalogOption(to) //Otra opción es un pdf que tenga todos los productos/servicios y se envia directamrne
            return;
        case "option2":
            await this.sendOrderOption(to)
            return;
        case "option3":
            response = "Esta es mi Ubicación"
            break;
        case "order_option1":
          this.orderState[to] = {step: "name"};
          response = "Por favor, ingresa tu nombre: "
          console
          break;
        case "delivery_option1":
          this.orderState[to].deliveryAddress = "Retiro en tienda";
          response = await this.completeOrder(to)
          break;
        case "delivery_option2":
          response = "Por favor, envia la dirección para la entrega."
          break;
        case "catalog_option1":
          urlCatalog = "https://media.canva.com/v2/image-resize/format:PNG/height:550/quality:100/uri:s3%3A%2F%2Fmedia-private.canva.com%2FQWP0c%2FMAGapKQWP0c%2F1%2Fp.png/watermark:F/width:388?csig=AAAAAAAAAAAAAAAAAAAAAKIhALWDl2mz_tkNQefVi5mYzz76FRpJhk2m044SC_yM&exp=1735499565&osig=AAAAAAAAAAAAAAAAAAAAAOOGNxaDOIalgMXBvUXjlnneZAY3Px4QYDzfvg5qtx_9&signer=media-rpc&x-canva-quality=thumbnail_large"
          whatsappService.sendMediaMessage(to, "image", urlCatalog, "¡Aquí puedes ver las distintas opciones de arreglos!")
          return;
        case "catalog_option2":
          urlCatalog = "https://media.canva.com/v2/image-resize/format:PNG/height:550/quality:100/uri:s3%3A%2F%2Fmedia-private.canva.com%2F_orbw%2FMAGapC_orbw%2F1%2Fp.png/watermark:F/width:388?csig=AAAAAAAAAAAAAAAAAAAAACAA4ljqygjs_YshF_z7QiMSlJO75bfJoBPrET0A7WdP&exp=1735502001&osig=AAAAAAAAAAAAAAAAAAAAAHnMS0gN_2Be16Z9S5Ac4wCfKSf0Eobj8ioUMvx06j3a&signer=media-rpc&x-canva-quality=thumbnail_large"
          whatsappService.sendMediaMessage(to, "image", urlCatalog, "¡Nuestros deliciosos postres!")
          return;
        default:
            response = "Lo siento, no entendi tu seleccón. por favor, elige una de las opciones"
    }
    await whatsappService.sendMessage(to, response)
  }

  //Send multimedia messages
  async sendMedia (to, type){
    try{
      let mediaUrl;
      let caption;
      let filename;

      switch(type){
        case "audio":
          mediaUrl = "https://s3.amazonaws.com/gndx.dev/medpet-audio.aac";
          break;
        case "video":
          mediaUrl = 'https://s3.amazonaws.com/gndx.dev/medpet-video.mp4';
          caption = '¡Esto es una video!';
          break;
        case "document":
          mediaUrl = 'https://s3.amazonaws.com/gndx.dev/medpet-file.pdf';
          caption = '¡Esto es un PDF!'
          filename = "dulcesorpresa.pdf"
          break;
        case "image":
          mediaUrl = 'https://s3.amazonaws.com/gndx.dev/medpet-imagen.png';
          caption = '¡Esto es una Imagen!'
          break;
      }

      await whatsappService.sendMediaMessage(to, type, mediaUrl, caption, filename)

    }catch(e){
      console.error("Error in SendMedia: ", e)
    }
  }

  async handleOrderFlow(to, message){
    const state = this.orderState[to];
    let response;

    switch(state.step){
      case "name":
        state.name = message
        state.step = "orderCategory"
        response = "Gracias, ¿Podrías indicarnos el tipo de arreglo que te interesa? Tenemos opciones como: Flores con Chocolates, Frutas Decoradas, y Dulces Temáticos. Por favor, escribe el nombre del arreglo"
        break;
      case "orderCategory":
        state.orderCategory = message
        state.step = "orderDetails"
        response = "¡Genial! ¿Tienes alguna preferencia de color o algún mensaje especial que quieras incluir? Si es así, por favor detállalo."
        break;
      case "orderDetails":
        state.orderDetails = message
        state.step = "orderDate"
        response = "Perfecto, por favor indícanos la fecha en formato DD/MM/YYYY"
        break;
      case "orderDate":
        state.orderDate = message
        state.step = "deliveryAddress"
        await this.sendDeliveryOption(to);
        return;
      case "deliveryAddress":
        state.deliveryAddress = message
        response = await this.completeOrder(to)
        break;
      default:
        break;
    }

    await whatsappService.sendMessage(to, response)
  }

  async completeOrder(to){
    const order = this.orderState[to];
    delete this.orderState[to];

    const userData = [
      to,
      order.name,
      order.orderCategory,
      order.orderDetails,
      order.orderDate,
      order.deliveryAddress
    ]

    appendToSheet(userData)

    return `Gracias por confiar en Dulce Sorpresa. 
    Resumen de tu Pedido:
    
    Nombre: ${order.name}
    Tipo de arreglo: ${order.orderCategory}
    Detalles: ${order.orderDetails}
    Fecha de Entrega: ${order.orderDate}
    Retiro: ${order.deliveryAddress}
    
    Nos pondremos en contacto contigo pronto para confirmar los detalles del pago y la entrega.`
  }
}
export default new MessageHandler();