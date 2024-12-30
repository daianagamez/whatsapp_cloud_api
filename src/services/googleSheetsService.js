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

const appendToSheet = async (data, sheet) => {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: path.join(process.cwd(), 'src/credentials', 'credentials.json'),
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });

        const authClient = await auth.getClient();
        const spreadsheetId = '1VCi6LPdj9lmZoGHDWMdUEXEIG1kV2eNJW5NG1XBjW9c' //Id del documento

        await addRowToSheet(authClient, spreadsheetId, data, sheet);
        return 'Datos correctamente agregados'
    } catch (error) {
        console.error(error);
    }
}

export default appendToSheet;

