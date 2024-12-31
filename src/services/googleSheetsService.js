import path from "path";
import {google} from "googleapis";

const sheets = google.sheets("v4");

async function addRowToSheet(auth, spreadsheetId, values, sheet) {
    const request = {
        spreadsheetId,
        range: sheet, //Nombre de la hoja
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: {
            values: [values],
        },
        auth,
    }

    try {
        const response = (await sheets.spreadsheets.values.append(request).data);
        return response;
    } catch (error) {
        console.error(error)
    }
}

const appendToSheet = async (data, sheet, type) => {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: path.join(process.cwd(), 'src/credentials', 'credentials.json'),
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });

        const authClient = await auth.getClient();
        const spreadsheetId = '1VCi6LPdj9lmZoGHDWMdUEXEIG1kV2eNJW5NG1XBjW9c' //Id del documento

        if(type === "ADD"){
            await addRowToSheet(authClient, spreadsheetId, data, sheet);
            return 'Datos correctamente agregados'
        }else{
            const result = await findPhoneInSheet(authClient, spreadsheetId, data, sheet);
            return result;
        }
    } catch (error) {
        console.error("Error en appendToSheet: ", error);
    }
}

//Leer numeros
async function findPhoneInSheet(auth, spreadsheetId, phoneNumber, sheet) {
    const request = {
        spreadsheetId,
        range: sheet, //Nombre de la hoja
        auth,
    };

    try {
        const response = await sheets.spreadsheets.values.get(request);
        const rows = response.data.values;

        if (!rows || rows.length === 0) {
            return false; //No se encontraron datos en la hoja
        }

        //Buscar el número de teléfono en la primera columna
        for (let i = 0; i < rows.length; i++) {
            if (rows[i][0] && rows[i][0].toString() === phoneNumber.toString()) {
                console.log (`Número de teléfono encontrado en la fila ${i + 1}`);
                const associatedName = rows[i][1] || "Sin nombre asociado";
                console.log(associatedName)
                return associatedName
            }
        }

        return false; //Número de teléfono no encontrado
    } catch (error) {
        console.error("Error en findPhoneInSheet: ", error);
        throw new Error("Error al leer los datos de la hoja.");
    }
}

export default appendToSheet;

