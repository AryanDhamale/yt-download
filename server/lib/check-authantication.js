import 'dotenv/config';

function checkAuthantication(apikeys) {
    if(!apikeys || typeof apikeys !== 'string') {
        return false;
    }
    
    return process.env.AUTH_API_KEY === apikeys ; 
}

export default checkAuthantication;