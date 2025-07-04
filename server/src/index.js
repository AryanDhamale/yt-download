import express from "express"
import cors from 'cors'
import handlerLogic from "./routes/handler-logic.js";
import 'dotenv/config';
import checkAuthantication from "../lib/check-authantication.js";

const app = express();
const PORT = process.env.PORT || 8080;
const corsOptions={};

function startEngin() {
    try {

        app.use(cors(corsOptions));
        app.use(express.json());
        app.use((request,response,next)=>{
            if(!checkAuthantication(request.headers['x-api-key'])) {
                return response.status(400).json({msg:'Unauthorized!'});
            }
            else {
                next();
            }
        })

        // starting testing route // 
        app.get('/api/testing',function(request,response){
            return response.status(200).json({msg:'SHAO INDUSTRIAL'});
        });

        // meta data or st-downloading  // 

        app.use('/api',handlerLogic);


        // catch all routes // 
        //app.all('/*',function(err,request,response,next){})

        // error handling // 
        app.use((error,request,response,next)=>{
            const {status=503,message='something went wrong!'} = error ;
            return response.status(status).json({error:message});
        })

        
        app.listen(PORT, () => {
            console.log(`start listening at portno. ${PORT}`);
        })
    }
    catch (err) {
        console.log({msg:err.message,err});
        process.exit(1); // terminate the application here // 
    }
}

startEngin();