import { SerialPort } from 'serialport';

const portPath = 'COM5';
const baudRate = 115200;
const port = new SerialPort({ path: portPath, baudRate , autoOpen:false});
type Data = {
    info: string;
};
    export default function handler(
        req: NextApiRequest,
        res: NextApiResponse<Data>,
        ) {
        if (req.method === 'POST') {
        const { account, id } = req.body; // Extract the string and number from the request body
        
        console.log("Received text:", account);
        console.log("Received number:", id);
        const msg = account + ":" + id;
        console.log("input is: "+ msg);
        port.open(function (err) {
            if (err) {
              return console.log('Error opening port: ', err.message)
            }
          
            // Because there's no callback to write, write errors will be emitted on the port:
            port.write(msg);
            console.log("written");
            port.on("data",function(data){
                console.log(data.toString());
                
            })
            port.close();
          })

        // Respond with a success message
        res.status(200).json({info: "working!!" });
        }
    }